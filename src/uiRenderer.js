// UI Rendering Pipeline for zeroGuard Planet Wizard

export const uiRenderer = {
    // Renders the overall wizard navigation progress and step visibility
    renderNavigation(state) {
        const stepProgressLine = document.getElementById("step-progress-line");
        const navSteps = [
            document.getElementById("nav-step-1"),
            document.getElementById("nav-step-2"),
            document.getElementById("nav-step-3"),
            document.getElementById("nav-step-4")
        ];
        const panels = [
            document.getElementById("panel-step-1"),
            document.getElementById("panel-step-2"),
            document.getElementById("panel-step-3"),
            document.getElementById("panel-step-4")
        ];

        // Update progress bar line width
        if (stepProgressLine) {
            const percentage = ((state.currentStep - 1) / 3) * 100;
            stepProgressLine.style.width = `${percentage}%`;
        }

        // Toggle panels
        panels.forEach((panel, idx) => {
            if (!panel) return;
            if (idx + 1 === state.currentStep) {
                panel.classList.remove("hidden");
            } else {
                panel.classList.add("hidden");
            }
        });

        // Update nav icons classes
        navSteps.forEach((navStep, idx) => {
            if (!navStep) return;
            const stepNum = idx + 1;
            const iconBox = navStep.querySelector(".step-icon");
            const titleSpan = navStep.querySelector("span");

            if (stepNum < state.currentStep) {
                // Completed Steps
                iconBox.className = "step-icon w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-emerald-500 text-white border-2 border-emerald-400/30 transition-all duration-300";
                iconBox.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                `;
                titleSpan.className = "text-xs font-semibold text-emerald-400 font-sans tracking-wide";
            } else if (stepNum === state.currentStep) {
                // Current Active Step
                iconBox.className = "step-icon w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-blue-500 text-white border-2 border-blue-400/30 transition-all duration-300";
                iconBox.textContent = stepNum;
                titleSpan.className = "text-xs font-semibold text-blue-400 font-sans tracking-wide";
            } else {
                // Future Steps
                iconBox.className = "step-icon w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm bg-gray-900 text-gray-500 border-2 border-gray-800 transition-all duration-300";
                iconBox.textContent = stepNum;
                titleSpan.className = "text-xs font-semibold text-gray-500 font-sans tracking-wide";
            }
        });
    },

    // Renders the key loading status box in Step 1
    renderKeyStatus(state) {
        const keyStatusBox = document.getElementById("key-status-box");
        const keyIconBox = document.getElementById("key-icon-box");
        const keyStatusTitle = document.getElementById("key-status-title");
        const keyStatusDesc = document.getElementById("key-status-desc");
        const deleteStoredKeyBtn = document.getElementById("delete-stored-key-btn");
        const downloadStoredKeyBtn = document.getElementById("download-stored-key-btn");

        if (!keyStatusBox || !keyIconBox || !keyStatusTitle || !keyStatusDesc || !deleteStoredKeyBtn || !downloadStoredKeyBtn) return;

        const keyVal = state.selectedSecretKey;
        if (keyVal && (keyVal.length === 64 || keyVal.length === 256)) {
            keyStatusBox.className = "bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-4 mb-8 flex items-center justify-between gap-4";
            keyIconBox.className = "p-2 bg-emerald-500/10 text-emerald-400 rounded-lg";
            keyIconBox.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M2.166 11.37c1.371 1.24 3.67 1.085 5.085-.33l5.085-5.085a5 5 0 10-7.071-7.071L2.166 5.253a3.5 3.5 0 000 6.117zM11 5a1 1 0 11-2 0 1 1 0 012 0z" clip-rule="evenodd" /><path d="M13.757 10.458L8.11 16.106a1.5 1.5 0 01-1.06 1.06H4v-3.05a1.5 1.5 0 01.44-1.06l5.646-5.646a5.056 5.056 0 003.671 4.148z" /></svg>
            `;
            keyStatusTitle.textContent = "已就绪：本地存储中已包含身份签名私钥";
            keyStatusDesc.textContent = `私钥项 "identity.secret" 已成功灌入浏览器 LocalStorage 缓存。`;
            deleteStoredKeyBtn.classList.remove("hidden");
            downloadStoredKeyBtn.classList.remove("hidden");
        } else {
            keyStatusBox.className = "bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 mb-8 flex items-center justify-between gap-4";
            keyIconBox.className = "p-2 bg-blue-500/10 text-blue-400 rounded-lg";
            keyIconBox.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>
            `;
            keyStatusTitle.textContent = "未检测到本地私钥（可选）";
            keyStatusDesc.textContent = "如果您没有现成的私钥，第 4 步编译时引擎将为您全新创建并保存下载。";
            deleteStoredKeyBtn.classList.add("hidden");
            downloadStoredKeyBtn.classList.add("hidden");
        }
    },

    // Renders the roots nodes list card form in Step 3
    renderRootsForm(state) {
        const rootsFormList = document.getElementById("roots-form-list");
        const addRootBtn = document.getElementById("add-root-btn");
        const editorWorldId = document.getElementById("editor-world-id");

        if (!rootsFormList) return;

        if (addRootBtn) {
            addRootBtn.disabled = state.configData.roots.length >= 4;
        }

        if (editorWorldId && document.activeElement !== editorWorldId) {
            editorWorldId.value = state.configData.id;
        }

        if (state.configData.roots.length === 0) {
            rootsFormList.innerHTML = `
                <div class="text-center py-10 bg-gray-950/50 border border-gray-800 border-dashed rounded-xl flex flex-col items-center justify-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gray-600 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                    <p class="text-xs font-medium">当前拓扑结构中没有根路由节点</p>
                    <p class="text-[10px] text-gray-600 mt-1">请点击右上方按钮添加一个 Roots 服务器。</p>
                </div>
            `;
            return;
        }

        // Cache existing input values to prevent cursor/focus losses
        const inputValues = Array.from(rootsFormList.querySelectorAll(".root-identity-input")).map(input => input.value);

        rootsFormList.innerHTML = "";

        state.configData.roots.forEach((root, rootIdx) => {
            const card = document.createElement("div");
            card.className = "root-card bg-[#070b12] border border-gray-800 rounded-xl p-5 relative space-y-4 hover:border-gray-700/80 transition-all";
            
            let endpointsHtml = "";
            root.stableEndpoints.forEach((ep, epIdx) => {
                endpointsHtml += `
                    <div class="endpoint-badge inline-flex items-center gap-1 bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-1 rounded-md text-xs font-mono select-all">
                        <span>${ep}</span>
                        <button type="button" data-ep-idx="${epIdx}" class="remove-endpoint-btn text-blue-500 hover:text-blue-300 p-0.5 rounded focus:outline-none cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                        </button>
                    </div>
                `;
            });

            // Use cached text value if available, else standard state value
            const cachedVal = inputValues[rootIdx] !== undefined ? inputValues[rootIdx] : root.identity;

            card.innerHTML = `
                <!-- Card header -->
                <div class="flex items-center justify-between gap-4 border-b border-gray-850 pb-3">
                    <span class="text-xs font-bold text-blue-400 uppercase tracking-wider">Root Server 根服务器 #${rootIdx + 1}</span>
                    <button type="button" class="delete-root-btn text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-1 transition-all cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                        删除节点
                    </button>
                </div>

                <!-- Identity Input -->
                <div>
                    <div class="flex justify-between items-center mb-1">
                        <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">公钥身份证书 (identity.public 文件内容)</label>
                        <span class="char-count text-[10px] text-gray-600 font-mono">0 / 141</span>
                    </div>
                    <input type="text" value="${cachedVal}" required placeholder="82e4b19c02:0:a79d0bc..."
                      class="root-identity-input w-full bg-[#0b0f19] border border-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-4 py-2.5 text-xs font-mono text-white transition-all" />
                </div>

                <!-- Endpoints Input -->
                <div class="space-y-2">
                    <label class="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        网络可达端点 IP/端口 路由表 (Endpoints - 最多 32 个)
                    </label>
                    
                    <div class="flex gap-2">
                        <input type="text" placeholder="示例: 127.0.0.1:9993 或 [::1]:9993"
                          class="endpoint-add-input flex-1 bg-[#0b0f19] border border-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-lg px-3 py-2 text-xs font-mono text-white transition-all" />
                        <button type="button" class="add-endpoint-btn text-xs font-semibold bg-gray-900 border border-gray-800 text-gray-300 hover:text-white px-4 rounded-lg transition-all cursor-pointer">
                          + 添加
                        </button>
                    </div>

                    <!-- badges list -->
                    <div class="endpoint-badges-container flex flex-wrap gap-2 pt-1.5">
                        ${endpointsHtml}
                    </div>
                </div>
            `;

            const identityInput = card.querySelector(".root-identity-input");
            const charCount = card.querySelector(".char-count");
            
            const updateCharCount = () => {
                const length = identityInput.value.trim().length;
                charCount.textContent = `${length} / 141`;
                if (length === 141) {
                    charCount.className = "char-count text-[10px] text-emerald-400 font-mono font-semibold";
                } else {
                    charCount.className = "char-count text-[10px] text-gray-600 font-mono";
                }
            };
            
            identityInput.addEventListener("input", () => {
                updateCharCount();
                state.mutations.updateRootIdentity(rootIdx, identityInput.value.trim());
            });
            updateCharCount();

            // Bind delete button
            card.querySelector(".delete-root-btn").addEventListener("click", () => {
                if (confirm("确定要删除这一个 Roots 节点吗？")) {
                    state.mutations.removeRoot(rootIdx);
                }
            });

            // Bind add endpoint
            const endpointAddInput = card.querySelector(".endpoint-add-input");
            const addEndpointBtn = card.querySelector(".add-endpoint-btn");
            
            const addEpFn = () => {
                const val = endpointAddInput.value.trim();
                if (!val) return;

                if (!/^[0-9a-zA-Z\.:\[\]]+:\d+$/.test(val)) {
                    alert("❌ 输入的 IP/端口 端点格式不正确！必须为 <IP地址/域名>:<端口号>，例如: 127.0.0.1:9993 或 [::1]:9993");
                    return;
                }

                if (state.mutations.addEndpoint(rootIdx, val)) {
                    endpointAddInput.value = "";
                } else {
                    alert("❌ 该端点已存在，或已达到该节点 32 个端点的限制上限。");
                }
            };

            addEndpointBtn.addEventListener("click", addEpFn);
            endpointAddInput.addEventListener("keypress", (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    addEpFn();
                }
            });

            // Bind remove endpoint badges
            card.querySelectorAll(".remove-endpoint-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    const epIdx = parseInt(btn.getAttribute("data-ep-idx"));
                    state.mutations.removeEndpoint(rootIdx, epIdx);
                });
            });

            rootsFormList.appendChild(card);
        });
    },

    // Renders the final compilation configuration summary in Step 4
    renderStep4Summary(state) {
        const sumWorldId = document.getElementById("sum-world-id");
        const sumRootsCount = document.getElementById("sum-roots-count");
        const sumKeyStatus = document.getElementById("sum-key-status");

        if (sumWorldId) {
            sumWorldId.textContent = "0x" + state.configData.id.toString(16).toUpperCase();
        }
        
        if (sumRootsCount) {
            sumRootsCount.textContent = `${state.configData.roots.length} / 4`;
        }
        
        if (sumKeyStatus) {
            const keyVal = state.selectedSecretKey;
            if (keyVal && (keyVal.length === 64 || keyVal.length === 256)) {
                sumKeyStatus.textContent = "已载入本地私钥";
                sumKeyStatus.className = "text-lg font-bold text-emerald-400 mt-1";
            } else {
                sumKeyStatus.textContent = "编译时自动创建并备份";
                sumKeyStatus.className = "text-lg font-bold text-yellow-400 mt-1";
            }
        }
    },

    // Global render pipeline orchestrator
    render(state) {
        this.renderNavigation(state);
        this.renderKeyStatus(state);
        
        if (state.currentStep === 3) {
            this.renderRootsForm(state);
        } else if (state.currentStep === 4) {
            this.renderStep4Summary(state);
        }
    }
};
