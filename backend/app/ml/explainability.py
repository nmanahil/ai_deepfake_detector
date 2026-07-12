"""
Attention Rollout explainability for Vision Transformers.

Grad-CAM targets CNN feature maps; for ViT the standard technique is
Attention Rollout (Abnar & Zuidema, 2020): recursively multiply attention
matrices across all layers so that the final map reflects how information
from each patch flows to the [CLS] token used for classification.

The model must be loaded with output_attentions=True at from_pretrained time
(passing it only at forward-pass time is insufficient for this checkpoint).
"""

import io
import base64
import numpy as np
import torch
from PIL import Image
from transformers import ViTForImageClassification, ViTImageProcessor


def _attention_rollout(attentions: tuple[torch.Tensor, ...]) -> np.ndarray:
    """
    Compute attention rollout from per-layer attention tensors.
    Each tensor: (1, num_heads, seq_len, seq_len).
    Returns a 1-D array of patch scores (seq_len - 1), excluding [CLS].
    """
    rollout = torch.eye(attentions[0].shape[-1])
    for attn in attentions:
        avg = attn.squeeze(0).mean(dim=0)           # (seq_len, seq_len)
        avg = avg + torch.eye(avg.shape[0])         # residual connection
        avg = avg / avg.sum(dim=-1, keepdim=True)   # row-normalise
        rollout = avg @ rollout

    cls_attn: np.ndarray = rollout[0, 1:].detach().numpy()  # drop [CLS] itself
    return cls_attn


def generate_heatmap(
    model: ViTForImageClassification,
    processor: ViTImageProcessor,
    image: Image.Image,
) -> str:
    """
    Run a forward pass, compute attention rollout, and return a base64-encoded
    PNG of the heatmap overlaid on the input image.

    Returns base64 so the API layer can embed it directly in JSON without a
    separate binary endpoint.

    Requires the model to have been loaded with output_attentions=True.
    """
    inputs = processor(images=image, return_tensors="pt")

    with torch.no_grad():
        outputs = model(**inputs)

    if outputs.attentions is None or outputs.attentions[0] is None:
        raise RuntimeError(
            "Model did not return attention weights. "
            "Load with output_attentions=True in from_pretrained()."
        )

    patch_scores = _attention_rollout(outputs.attentions)

    num_patches_side = int(len(patch_scores) ** 0.5)
    grid = patch_scores.reshape(num_patches_side, num_patches_side)

    grid = (grid - grid.min()) / (grid.max() - grid.min() + 1e-8)
    heatmap_arr = np.array(
        Image.fromarray((grid * 255).astype(np.uint8)).resize(
            image.size, resample=Image.BILINEAR
        )
    )

    rgba = np.zeros((*heatmap_arr.shape, 4), dtype=np.uint8)
    rgba[..., 0] = heatmap_arr                          # red channel
    rgba[..., 3] = (heatmap_arr * 0.6).astype(np.uint8)  # alpha

    overlay = Image.alpha_composite(
        image.convert("RGBA"),
        Image.fromarray(rgba, "RGBA"),
    ).convert("RGB")

    buf = io.BytesIO()
    overlay.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")
