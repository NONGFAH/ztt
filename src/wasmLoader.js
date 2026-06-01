// Wasm Runtime Loader & Self-Healing Bootstrap Sequence

export const wasmLoader = {
    isLoaded: false,
    
    async load(onStatusChange) {
        if (this.isLoaded) return true;
        
        try {
            // 1. Check/Load Go's wasm_exec.js global bridge runtime
            if (typeof Go === 'undefined') {
                if (onStatusChange) onStatusChange("加载 WASM 适配器...", "loading");
                await new Promise((resolve, reject) => {
                    const script = document.createElement("script");
                    script.src = "/wasm_exec.js";
                    script.onload = resolve;
                    script.onerror = () => reject(new Error("无法加载 /wasm_exec.js 适配文件"));
                    document.head.appendChild(script);
                });
            }

            // 2. Setup and run Go WASM module
            const go = new Go();
            if (onStatusChange) onStatusChange("装载运行时中...", "loading");

            const result = await WebAssembly.instantiateStreaming(fetch("/main.wasm"), go.importObject);
            go.run(result.instance);

            // 3. Verify that zeroGuard bridge hooks are present
            if (typeof window.genPlanetDirect === 'function') {
                this.isLoaded = true;
                if (onStatusChange) onStatusChange("已就绪", "ready");
                return true;
            } else {
                throw new Error("Go WASM runtime booted, but genPlanetDirect bridging function is missing.");
            }
        } catch (err) {
            console.error("booting WASM error:", err);
            if (onStatusChange) onStatusChange("引擎错误", "error");
            throw err;
        }
    }
};
