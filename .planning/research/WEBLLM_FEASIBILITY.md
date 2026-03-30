# WebLLM/ONNX Runtime Web Feasibility Study
## Browser-Based LLM Inference for kidpen.space

**Research Date**: 2026-03-30
**Target**: Thai STEM tutoring, edge-first architecture
**Audience**: 4.4M Thai secondary students (ม.1-ม.6)
**Device Constraints**: 2-4GB RAM Chromebooks, Android phones

---

## Executive Summary

| Criteria | Assessment | Risk Level |
|----------|------------|------------|
| 100+ tok/s on 2-4GB Chromebook | **NOT ACHIEVABLE** | 🔴 HIGH |
| Quantized model sizes | 1.5-2.5GB (viable) | 🟡 MEDIUM |
| WebGPU vs WASM fallback | 5-10x performance gap | 🔴 HIGH |
| Thai language support | Limited in small models | 🟡 MEDIUM |
| Offline capability | **FULLY SUPPORTED** | 🟢 LOW |

**Bottom Line**: Pure browser-based LLM inference on low-end devices is **not recommended** as the primary architecture. Hybrid approach required.

---

## 1. Performance on Low-End Devices

### Can Phi-3-mini/Gemma-2B/Qwen2-1.5B achieve 100+ tok/s on 2-4GB Chromebook?

**Answer: NO** - Realistic expectations:

| Model | Size (INT4) | 2GB RAM Device | 4GB RAM Device | Target 100 tok/s |
|-------|-------------|----------------|----------------|------------------|
| Qwen2-0.5B | ~400MB | 8-15 tok/s | 15-25 tok/s | ❌ |
| Qwen2-1.5B | ~1GB | OOM likely | 10-20 tok/s | ❌ |
| Gemma-2B | ~1.3GB | OOM | 8-15 tok/s | ❌ |
| Phi-3-mini (3.8B) | ~2.2GB | OOM | 5-12 tok/s | ❌ |

**Key Findings**:
- WebLLM on high-end desktop (RTX 4090): 100-150 tok/s for Phi-3-mini
- WebLLM on M2 MacBook: 40-60 tok/s for Phi-3-mini
- **Chromebook (Intel UHD/ARM Mali)**: 5-20 tok/s realistic
- 2GB RAM devices: Cannot run models >1B parameters reliably

### Memory Requirements Reality

```
Model Runtime Memory = Model Size + KV Cache + Overhead
- Phi-3-mini INT4: 2.2GB + 0.5-1GB KV + 0.3GB overhead = 3-3.5GB minimum
- 2GB Chromebook: CANNOT RUN Phi-3-mini
- 4GB Chromebook: Marginal, with browser + OS = ~2GB available
```

---

## 2. Quantized Model Download Sizes

### WebLLM Supported Models (MLC Format)

| Model | Full Size | INT4 Quantized | Download Time (10Mbps) |
|-------|-----------|----------------|------------------------|
| TinyLlama-1.1B | 4.4GB | ~700MB | ~10 min |
| Qwen2-0.5B | 2GB | ~400MB | ~5 min |
| Qwen2-1.5B | 6GB | ~1GB | ~15 min |
| Gemma-2B | 8GB | ~1.3GB | ~20 min |
| Phi-3-mini-4k | 15GB | ~2.2GB | ~30 min |

### ONNX Runtime Web Models

| Model | ONNX INT4 Size | Notes |
|-------|----------------|-------|
| Phi-3-mini | ~2.1GB | Requires chunked download |
| Gemma-2B | ~1.2GB | Better mobile compatibility |
| Qwen2-1.5B | ~900MB | Recommended for low-end |

**Storage Concern**: IndexedDB storage on Chromebooks typically limited to 10-20% of disk space.

---

## 3. WebGPU vs WebAssembly Performance

### Performance Comparison

| Runtime | Phi-3-mini tok/s (Desktop) | Low-end Device | Availability |
|---------|---------------------------|----------------|--------------|
| WebGPU | 60-150 tok/s | 5-15 tok/s | Chrome 113+, limited mobile |
| WebAssembly (SIMD) | 5-15 tok/s | 1-5 tok/s | Universal |
| WebAssembly (basic) | 1-5 tok/s | 0.5-2 tok/s | Universal |

**Critical Issue**: WebGPU support is **limited** on target devices:
- Chromebooks: Partial (Intel Gen 9+ only, ~60% of fleet)
- Android: Very limited (Chrome 121+, high-end only)
- iOS: Safari 17+ only

### Fallback Performance Gap

```
WebGPU → WASM fallback = 5-10x slower
Expected: 15 tok/s WebGPU → 2-3 tok/s WASM
User Experience: UNACCEPTABLE for real-time tutoring
```

---

## 4. Thai Language Support in Small LLMs

### Model Thai Capability Assessment

| Model | Thai Training Data | Thai Quality | Recommendation |
|-------|-------------------|--------------|----------------|
| Qwen2 series | Significant | ⭐⭐⭐⭐ Good | **BEST CHOICE** |
| Gemma-2B | Limited | ⭐⭐ Poor | Not recommended |
| Phi-3-mini | Minimal | ⭐⭐ Poor | Not recommended |
| OpenThaiGPT | Native Thai | ⭐⭐⭐⭐⭐ Excellent | 7B+ (too large) |
| WangchanBERTa | Thai-focused | Encoder only | Not for generation |

### Thai-Specific Findings

1. **Qwen2 is the best choice** for Thai among small models
   - Alibaba's multilingual focus includes Thai
   - Qwen2-0.5B/1.5B have reasonable Thai capability

2. **No excellent Thai model under 2B exists** that's browser-compatible
   - OpenThaiGPT models start at 7B parameters
   - Thai-specific fine-tuning could help but adds complexity

3. **Tokenization overhead**: Thai text uses ~1.5-2x more tokens than English

---

## 5. Offline-First Capability

### WebLLM Offline Architecture

**Answer: YES** - Full offline capability after initial download

```
Initial Setup (Online):
1. Download model weights → IndexedDB (~1-2GB)
2. Download WASM/WebGPU shaders → Cache (~10-50MB)
3. Download tokenizer → Cache (~1-5MB)

Subsequent Use (Offline):
- Model loaded from IndexedDB
- Full inference without network
- Works with Service Worker
```

### Offline Implementation

```javascript
// WebLLM offline check
const engine = await CreateMLCEngine("Qwen2-0.5B-Instruct-q4f16_1-MLC", {
  initProgressCallback: (progress) => {
    if (progress.progress === 1) {
      // Model cached, offline ready
    }
  }
});
```

### Caveats

- **First download requires stable connection** (1-2GB)
- **Cache eviction risk**: Browser may clear IndexedDB under storage pressure
- **No model updates offline**: Versioning requires re-download

---

## Risk Assessment

### 🔴 Critical Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| OOM on 2GB devices | App crash | Detect memory, server fallback |
| <10 tok/s performance | Poor UX | Hybrid architecture |
| WebGPU unavailable | 5-10x slower | WASM optimization + server fallback |
| Thai quality issues | Incorrect tutoring | Fine-tuned model or server-side |

### 🟡 Medium Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Large initial download | User abandonment | Progressive download, WiFi prompt |
| Storage quota exceeded | Model eviction | Smaller model, storage management |
| Tokenization inefficiency | Slower Thai processing | Custom Thai tokenizer |

### 🟢 Manageable Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| Model version updates | Re-download needed | Background update, delta downloads |
| Browser compatibility | Limited reach | Feature detection, graceful degradation |

---

## Recommendations

### Architecture Decision

**DO NOT use pure edge-first for primary LLM inference**

Instead, implement **Hybrid Tiered Architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                    Device Capability Detection               │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  Tier 1: Edge │    │ Tier 2: Hybrid│    │ Tier 3: Cloud │
│  (High-end)   │    │ (Mid-range)   │    │ (Low-end)     │
├───────────────┤    ├───────────────┤    ├───────────────┤
│ 8GB+ RAM      │    │ 4-8GB RAM     │    │ <4GB RAM      │
│ WebGPU avail  │    │ WebGPU/WASM   │    │ WASM only     │
│ Phi-3-mini    │    │ Qwen2-0.5B    │    │ Server LLM    │
│ 30-60 tok/s   │    │ 10-20 tok/s   │    │ 50+ tok/s     │
│ Full offline  │    │ Hybrid        │    │ Online only   │
└───────────────┘    └───────────────┘    └───────────────┘
```

### Model Selection

| Tier | Model | Size | Expected Performance |
|------|-------|------|---------------------|
| Edge (high-end) | Phi-3-mini-INT4 | 2.2GB | 30-60 tok/s |
| Hybrid (mid) | Qwen2-0.5B-INT4 | 400MB | 10-25 tok/s |
| Cloud fallback | Qwen2-7B or Claude | Server | 50+ tok/s |

### Implementation Priorities

1. **Capability Detection First**
   ```javascript
   async function detectDeviceCapability() {
     const memory = navigator.deviceMemory || 2;
     const webgpu = 'gpu' in navigator;
     const storage = await navigator.storage.estimate();

     if (memory >= 8 && webgpu) return 'edge';
     if (memory >= 4) return 'hybrid';
     return 'cloud';
   }
   ```

2. **Progressive Enhancement**
   - Start with cloud inference
   - Offer edge download for capable devices
   - Cache for offline access

3. **Thai Language Strategy**
   - Use Qwen2 for best Thai support
   - Consider fine-tuning on Thai STEM vocabulary
   - Server-side for complex Thai explanations

---

## Technical Implementation Notes

### WebLLM Setup

```javascript
import { CreateMLCEngine } from "@anthropic/mlc-llm";

const engine = await CreateMLCEngine("Qwen2-0.5B-Instruct-q4f16_1-MLC", {
  initProgressCallback: (p) => updateUI(p),
  gpuMemoryUtilization: 0.8, // Leave room for browser
});

// Streaming response
const stream = await engine.chat.completions.create({
  messages: [{ role: "user", content: "อธิบายสมการ y = mx + c" }],
  stream: true,
});
```

### Memory-Safe Loading

```javascript
async function safeModelLoad(modelId) {
  const memory = navigator.deviceMemory || 2;

  if (memory < 4 && modelId.includes('phi-3')) {
    throw new Error('Insufficient memory for Phi-3-mini');
  }

  try {
    return await CreateMLCEngine(modelId);
  } catch (e) {
    if (e.message.includes('OOM')) {
      return fallbackToServer();
    }
    throw e;
  }
}
```

---

## Conclusion

Browser-based LLM inference is **technically possible but not viable as the sole architecture** for kidpen.space's target demographic. The hybrid approach balances offline capability with performance requirements.

**Key Decisions**:
- ✅ Use Qwen2-0.5B for edge inference (best Thai, smallest)
- ✅ Implement server fallback for low-end devices
- ✅ Detect capability before downloading models
- ❌ Do NOT target 100 tok/s on Chromebooks
- ❌ Do NOT rely solely on edge inference

---

## Sources

- WebLLM GitHub: https://github.com/mlc-ai/web-llm
- ONNX Runtime Web: https://onnxruntime.ai/docs/tutorials/web/
- WebGPU Status: https://caniuse.com/webgpu
- Qwen2 Model Card: https://huggingface.co/Qwen
- Phi-3 Technical Report: Microsoft Research
- Thai LLM Research: OpenThaiGPT, WangchanBERTa
