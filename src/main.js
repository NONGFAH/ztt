import './style.css';
import { state } from './state.js';
import { wasmLoader } from './wasmLoader.js';
import { uiRenderer } from './uiRenderer.js';
import { toast } from './toast.js';

// ==========================================
// 1. CONFIGURATION & CONSTANTS
// ==========================================
const DEFAULT_SECRET_STORAGE_KEY = "identity.secret";

const DEFAULT_JSON_TEMPLATE = {
    id: 88888888,
    worldType: "planet",
    roots: []
};

// ==========================================
// 2. HELPER UTILITIES
// ==========================================
function bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function stringToHex(str) {
    let hex = '';
    for (let i = 0; i < str.length; i++) {
        let charCode = str.charCodeAt(i);
        let hexPart = charCode.toString(16);
        hex += (hexPart.length < 2 ? '0' + hexPart : hexPart);
    }
    return hex;
}

// Check local storage key and synchronize with state
function checkStoredKey() {
    const keyVal = localStorage.getItem(DEFAULT_SECRET_STORAGE_KEY);
    if (keyVal && (keyVal.length === 64 || keyVal.length === 256)) {
        state.mutations.setSecretKey(keyVal);
    } else {
        state.mutations.setSecretKey(null);
    }
}

// ==========================================
// 3. REACTIVE STATE RENDERING SUBSCRIPTION
// ==========================================
state.subscribe((currentState) => {
    uiRenderer.render(currentState);
});

// ==========================================
// 4. DOM EVENTS & STATIC ROUTING WIRING
// ==========================================

// STEP 1 Navigation & Actions
const btnNext1 = document.getElementById("btn-next-1");
btnNext1.addEventListener("click", () => state.mutations.setStep(2));

const deleteStoredKeyBtn = document.getElementById("delete-stored-key-btn");
deleteStoredKeyBtn.addEventListener("click", () => {
    if (confirm("确定要从浏览器存储中清除该私钥吗？这不会影响您下载过的备份文件。")) {
        localStorage.removeItem(DEFAULT_SECRET_STORAGE_KEY);
        checkStoredKey();
        toast.info("已成功清除本地私钥缓存。");
    }
});

const downloadStoredKeyBtn = document.getElementById("download-stored-key-btn");
downloadStoredKeyBtn.addEventListener("click", () => {
    const keyVal = state.selectedSecretKey;
    if (!keyVal) {
        toast.error("没有检测到本地私钥，无法下载！");
        return;
    }

    let bytes;
    if (keyVal.length === 64 || keyVal.length === 256) {
        const hex = keyVal;
        const len = hex.length / 2;
        bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        }
    } else {
        toast.error("存储的私钥格式非法，无法下载！");
        return;
    }

    const blob = new Blob([bytes], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement("a");
    a.href = url;
    a.download = "identity.secret";
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);

    toast.success("🔑 身份私钥备份文件 (identity.secret) 下载已开始！");
});

// Drag and drop private key upload
const keyUploadZone = document.getElementById("key-upload-zone");
const keyFileInput = document.getElementById("key-file-input");

keyUploadZone.addEventListener("click", () => keyFileInput.click());
keyUploadZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    keyUploadZone.classList.add("border-blue-500", "bg-blue-500/5");
});
keyUploadZone.addEventListener("dragleave", () => {
    keyUploadZone.classList.remove("border-blue-500", "bg-blue-500/5");
});
keyUploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    keyUploadZone.classList.remove("border-blue-500", "bg-blue-500/5");
    if (e.dataTransfer.files.length > 0) {
        handlePrivateKeyUpload(e.dataTransfer.files[0]);
    }
});
keyFileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
        handlePrivateKeyUpload(e.target.files[0]);
    }
});

async function handlePrivateKeyUpload(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        
        let hexString = "";
        if (bytes.length === 32 || bytes.length === 128) {
            hexString = bytesToHex(bytes);
        } else {
            const decoder = new TextDecoder("utf-8");
            const rawText = decoder.decode(bytes).trim();
            if ((rawText.length === 64 || rawText.length === 256) && /^[0-9a-fA-F]+$/.test(rawText)) {
                hexString = rawText.toLowerCase();
            } else {
                toast.error("私钥格式非法！合法的私钥二进制文件大小应为 32 或 128 字节，明文十六进制字符串长度应为 64 或 256 个字符。");
                return;
            }
        }

        localStorage.setItem(DEFAULT_SECRET_STORAGE_KEY, hexString);
        checkStoredKey();
        toast.success("私钥成功载入本地 LocalStorage 存储中！已开启安全主权校验。");
    } catch (err) {
        console.error(err);
        toast.error("读取私钥发生错误: " + err.message);
    }
}

// Generate new identity
const triggerGenKeyBtn = document.getElementById("trigger-gen-key-btn");
triggerGenKeyBtn.addEventListener("click", () => {
    if (!wasmLoader.isLoaded) {
        toast.warning("WASM 编译引擎尚未完全就绪，或者域名验证失败。请稍候或检查控制台错误信息！");
        return;
    }

    const existingKey = localStorage.getItem(DEFAULT_SECRET_STORAGE_KEY);
    
    if (existingKey && (existingKey.length === 64 || existingKey.length === 256)) {
        const confirmMsg = "⚠️ 警告：检测到本地浏览器存储中已经包含一个身份签名私钥！\n\n生成全新的随机私钥将会彻底覆盖并失效当前的密钥（如果您以前签署过 Planet，丢失旧密钥将导致未来无法升级该 Planet 拓扑）。\n\n在生成新密钥前，建议您先点击“下载此密钥”以备份当前的私钥。\n\n您确定要覆盖现有密钥并生成全新的私钥吗？";
        if (!confirm(confirmMsg)) {
            return;
        }
    }
    
    try {
        const responseJsonStr = window.genIdentity(DEFAULT_SECRET_STORAGE_KEY);
        const response = JSON.parse(responseJsonStr);
        
        if (response.flag) {
            toast.success("✨ 新的 Curve25519 身份私钥已成功创建并保存入本地浏览器存储！");
            checkStoredKey();
        } else {
            toast.error("生成私钥失败: " + response.result);
        }
    } catch (err) {
        console.error(err);
        toast.error("调用私钥生成引擎异常: " + err.message);
    }
});


// STEP 2 Navigation & Actions
const btnBack2 = document.getElementById("btn-back-2");
btnBack2.addEventListener("click", () => state.mutations.setStep(1));

const btnNext2 = document.getElementById("btn-next-2");
btnNext2.addEventListener("click", () => state.mutations.setStep(3));

const methodScratch = document.getElementById("method-scratch");
const methodUpload = document.getElementById("method-upload");
methodScratch.addEventListener("click", () => {
    state.mutations.setConfigData(JSON.parse(JSON.stringify(DEFAULT_JSON_TEMPLATE)));
    
    methodScratch.classList.add("border-blue-500", "bg-blue-500/5");
    methodUpload.classList.remove("border-purple-500", "bg-purple-500/5");
    btnNext2.disabled = false;
    btnNext2.className = "btn bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-all flex items-center gap-1 cursor-pointer";
    
    state.mutations.setStep(3);
});

// Drag and drop existing planet upload
const planetDropZone = document.getElementById("planet-drop-zone");
const planetFileInput = document.getElementById("planet-file-input");

planetDropZone.addEventListener("click", (e) => {
    e.stopPropagation();
    planetFileInput.click();
});
planetDropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    planetDropZone.classList.add("border-purple-500", "bg-purple-500/5");
});
planetDropZone.addEventListener("dragleave", () => {
    planetDropZone.classList.remove("border-purple-500", "bg-purple-500/5");
});
planetDropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    planetDropZone.classList.remove("border-purple-500", "bg-purple-500/5");
    if (e.dataTransfer.files.length > 0) {
        handleExistingPlanetParse(e.dataTransfer.files[0]);
    }
});
planetFileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
        handleExistingPlanetParse(e.target.files[0]);
    }
});

async function handleExistingPlanetParse(file) {
    if (!wasmLoader.isLoaded) {
        toast.warning("WASM 编译引擎尚未完全就绪，或者域名验证失败。请稍候或检查控制台错误信息！");
        return;
    }
    try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        const resolveJsonStr = window.resolvePlanet(uint8Array);
        const response = JSON.parse(resolveJsonStr);

        if (response.flag) {
            const world = JSON.parse(response.result);
            
            // Map parsed world into State Tree config schema
            const roots = (world.roots || []).map(root => ({
                identity: root.identity || "",
                stableEndpoints: root.stableEndpoints || []
            }));
            
            state.mutations.setConfigData({
                id: world.id,
                worldType: world.worldType === "planet" ? "planet" : "world",
                roots: roots
            });

            methodUpload.classList.add("border-purple-500", "bg-purple-500/5");
            methodScratch.classList.remove("border-blue-500", "bg-blue-500/5");
            btnNext2.disabled = false;
            btnNext2.className = "btn bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-6 rounded-lg text-sm transition-all flex items-center gap-1 cursor-pointer";
            
            toast.success(`成功导入并逆向还原 Planet 文件！\n- World ID: 0x${world.id.toString(16).toUpperCase()}\n- Roots 节点数: ${roots.length}\n即将自动载入参数编辑器！`);
            state.mutations.setStep(3);
        } else {
            toast.error("反解析已有 Planet 文件失败: " + response.result);
        }
    } catch (err) {
        console.error(err);
        toast.error("解析 Planet 抛出异常: " + err.message);
    }
}


// STEP 3 Navigation & Actions
const btnBack3 = document.getElementById("btn-back-3");
btnBack3.addEventListener("click", () => state.mutations.setStep(2));

const btnNext3 = document.getElementById("btn-next-3");
btnNext3.addEventListener("click", () => {
    // Sync active editor view back to state
    if (formEditorContainer.classList.contains("hidden")) {
        if (!syncJsonToConfigData()) {
            return;
        }
    }

    const roots = state.configData.roots;

    if (roots.length === 0) {
        toast.error("拓扑结构中必须包含至少一个 Root 根服务器节点！");
        return;
    }

    // 1. Validate each Root Server Node
    for (let i = 0; i < roots.length; i++) {
        const root = roots[i];
        const identity = (root.identity || "").trim();

        // Validate Identity (Public Key)
        if (identity.length === 0) {
            toast.error(`根服务器 #${i + 1} 的公钥身份证书不能为空！`);
            return;
        }
        if (identity.length !== 141 || !/^[0-9a-fA-F]{10}:[0-9a-fA-F]+:[0-9a-fA-F]{128}$/.test(identity)) {
            toast.error(`根服务器 #${i + 1} 的公钥身份证书格式非法！\n合法的公钥身份证书应为 141 位的标准 ZeroTier 公钥（格式：<10位地址>:<版本>:<128位公钥十六进制>）。`);
            return;
        }

        // Validate Endpoints (Stable Endpoints)
        if (!Array.isArray(root.stableEndpoints) || root.stableEndpoints.length === 0) {
            toast.error(`根服务器 #${i + 1} 必须配置至少一个网络可达的 IP:端口 端点！`);
            return;
        }

        for (let j = 0; j < root.stableEndpoints.length; j++) {
            const ep = root.stableEndpoints[j].trim();
            const match = ep.match(/^([0-9a-zA-Z\.:\[\]]+):(\d+)$/);
            if (!match) {
                toast.error(`根服务器 #${i + 1} 的第 ${j + 1} 个端点 "${ep}" 格式非法！\n必须为 <IP地址/域名>:<端口号>，例如: 127.0.0.1:9993 或 [::1]:9993`);
                return;
            }
            const port = parseInt(match[2], 10);
            if (port < 1 || port > 65535) {
                toast.error(`根服务器 #${i + 1} 的第 ${j + 1} 个端点 "${ep}" 端口越界！\n端口号必须位于 1 到 65535 之间。`);
                return;
            }
        }
    }

    state.mutations.setStep(4);
});

// Dual editor tab switcher
const toggleFormEditor = document.getElementById("toggle-form-editor");
const toggleJsonEditor = document.getElementById("toggle-json-editor");
const formEditorContainer = document.getElementById("form-editor-container");
const jsonEditorContainer = document.getElementById("json-editor-container");
const jsonRawEditor = document.getElementById("json-raw-editor");

toggleFormEditor.addEventListener("click", () => {
    if (formEditorContainer.classList.contains("hidden")) {
        if (syncJsonToConfigData()) {
            toggleFormEditor.className = "text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white shadow transition-all";
            toggleJsonEditor.className = "text-xs font-semibold px-3 py-1.5 rounded-lg text-gray-400 hover:text-gray-200 transition-all";
            formEditorContainer.classList.remove("hidden");
            jsonEditorContainer.classList.add("hidden");
            uiRenderer.renderRootsForm(state);
        }
    }
});

toggleJsonEditor.addEventListener("click", () => {
    if (jsonEditorContainer.classList.contains("hidden")) {
        toggleJsonEditor.className = "text-xs font-semibold px-3 py-1.5 rounded-lg bg-blue-600 text-white shadow transition-all";
        toggleFormEditor.className = "text-xs font-semibold px-3 py-1.5 rounded-lg text-gray-400 hover:text-gray-200 transition-all";
        jsonEditorContainer.classList.remove("hidden");
        formEditorContainer.classList.add("hidden");
        
        jsonRawEditor.value = JSON.stringify(state.configData, null, 4);
    }
});

const formatJsonBtn = document.getElementById("format-json-btn");
formatJsonBtn.addEventListener("click", () => {
    try {
        const parsed = JSON.parse(jsonRawEditor.value);
        jsonRawEditor.value = JSON.stringify(parsed, null, 4);
    } catch (e) {
        toast.error("JSON 语法错误，无法格式化: " + e.message);
    }
});

const editorWorldId = document.getElementById("editor-world-id");
editorWorldId.addEventListener("input", (e) => {
    state.mutations.setWorldId(parseInt(e.target.value) || 88888888);
});

const addRootBtn = document.getElementById("add-root-btn");
addRootBtn.addEventListener("click", () => {
    state.mutations.addRoot();
});

// Sync raw JSON textarea back to State Tree
function syncJsonToConfigData() {
    try {
        const parsed = JSON.parse(jsonRawEditor.value);
        if (typeof parsed.id !== "number") {
            throw new Error("字段 'id' 必须是数字类型。");
        }
        if (!Array.isArray(parsed.roots)) {
            throw new Error("字段 'roots' 必须是数组 structure。");
        }
        
        state.mutations.setConfigData(parsed);
        return true;
    } catch (err) {
        toast.error("无法解析 JSON！请更正语法错误后再试。\n错误提示: " + err.message);
        return false;
    }
}


// STEP 4 Navigation & Actions
const btnBack4 = document.getElementById("btn-back-4");
btnBack4.addEventListener("click", () => state.mutations.setStep(3));

const outputPlanetName = document.getElementById("output-planet-name");
const secretKeyStorageName = document.getElementById("secret-key-storage-name");
const triggerCompileBtn = document.getElementById("trigger-compile-btn");

// Compile and Sign planet using WASM Direct parameter invocation
triggerCompileBtn.addEventListener("click", () => {
    if (!wasmLoader.isLoaded) {
        toast.warning("WASM 编译引擎尚未完全就绪，或者域名验证失败。请稍候或检查控制台错误信息！");
        return;
    }

    const secretPath = secretKeyStorageName.value.trim() || DEFAULT_SECRET_STORAGE_KEY;
    const planetPath = outputPlanetName.value.trim() || "planet";
    const keyVal = localStorage.getItem(secretPath);

    // Dynamic key generation check
    if (!keyVal || (keyVal.length !== 64 && keyVal.length !== 256)) {
        if (confirm(`⚠️ 检测到您尚未载入身份签名私钥！\n\n为了编译能顺利运行，我们将为您在本地自动生成全新 Curve25519 私钥，并存入本地浏览器存储。\n\n请点击确认以开始生成（您可以随时在 Step 1 中下载备份此密钥）。生成完毕后，再次点击此编译按钮即可生成最终的 Planet 路由二进制包！`)) {
            const responseJsonStr = window.genIdentity(secretPath);
            const response = JSON.parse(responseJsonStr);
            if (response.flag) {
                checkStoredKey();
                toast.success(`✨ Curve25519 身份私钥已成功创建并保存入本地浏览器存储！\n\n现在私钥已成功就绪，请再次点击 [签署并下载二进制] 按钮完成最终 Planet 编译。`);
            } else {
                toast.error("自动生成私钥失败: " + response.result);
            }
        }
        return;
    }

    if (state.configData.roots.length === 0) {
        toast.error("无法生成！配置中没有任何 Root 服务器，请在上一步添加根节点。");
        state.mutations.setStep(3);
        return;
    }

    // Verify all identities lengths
    const invalidIdx = state.configData.roots.findIndex(r => r.identity.trim().length !== 141);
    if (invalidIdx !== -1) {
        toast.error(`无法生成！第 ${invalidIdx + 1} 个 Root 根服务器的公钥证书长度不是合法的 141 位。请返回第 3 步修改。`);
        state.mutations.setStep(3);
        return;
    }

    try {
        // Direct JS parameter passing - 100% localStorage decoupled for compiling config data!
        const configJsonStr = JSON.stringify(state.configData);
        
        // Invoke the pure genPlanetDirect Go WASM API
        const responseJsonStr = window.genPlanetDirect(keyVal, configJsonStr, planetPath);
        const response = JSON.parse(responseJsonStr);

        if (response.flag) {
            toast.success("恭喜！WASM 签署引擎已顺利签署编译出最终 Planet 二进制文件！\n浏览器应该已为您自动下载该文件。");
        } else {
            toast.error("编译失败: " + response.result);
        }
    } catch (err) {
        console.error(err);
        toast.error("签署引擎编译抛出异常: " + err.message);
    }
});


// ==========================================
// 5. BOOTSTRAPING SEQUENCE
// ==========================================
const wasmStatus = document.getElementById("wasm-status");

// Check stored keys on startup
checkStoredKey();

// Set initial step and trigger render
state.mutations.setStep(1);

// Boot WebAssembly runtime with UI hooks
wasmLoader.load((message, status) => {
    if (wasmStatus) {
        wasmStatus.textContent = message;
        if (status === "ready") {
            wasmStatus.className = "px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md tracking-wider uppercase";
            if (triggerCompileBtn) triggerCompileBtn.disabled = false;
            if (triggerGenKeyBtn) triggerGenKeyBtn.disabled = false;
        } else if (status === "error") {
            wasmStatus.className = "px-2.5 py-1 text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 rounded-md tracking-wider uppercase";
        } else {
            wasmStatus.className = "px-2.5 py-1 text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20 rounded-md tracking-wider uppercase transition-all duration-300";
        }
    }
}).catch((err) => {
    console.error("Failed to bootstrap WASM engine:", err);
});

// ==========================================
// 6. SUPPORT MODAL CONTROLLER
// ==========================================
const triggerSupportModal = document.getElementById("trigger-support-modal");
const triggerSupportModalFab = document.getElementById("trigger-support-modal-fab");
const supportModal = document.getElementById("support-modal");
const supportModalBox = document.getElementById("support-modal-box");
const closeSupportModal = document.getElementById("close-support-modal");

function openSupportModal() {
    if (supportModal && supportModalBox) {
        supportModal.classList.remove("opacity-0", "pointer-events-none");
        supportModalBox.classList.remove("scale-95");
        supportModalBox.classList.add("scale-100");
    }
}

function closeSupportModalFn() {
    if (supportModal && supportModalBox) {
        supportModal.classList.add("opacity-0", "pointer-events-none");
        supportModalBox.classList.remove("scale-100");
        supportModalBox.classList.add("scale-95");
    }
}

if (triggerSupportModal) triggerSupportModal.addEventListener("click", openSupportModal);
if (triggerSupportModalFab) triggerSupportModalFab.addEventListener("click", openSupportModal);
if (closeSupportModal) closeSupportModal.addEventListener("click", closeSupportModalFn);

if (supportModal) {
    supportModal.addEventListener("click", (e) => {
        if (e.target === supportModal) {
            closeSupportModalFn();
        }
    });
}

// Copy QQ Group Number to Clipboard
const copyGroupBtn = document.getElementById("copy-group-btn");
if (copyGroupBtn) {
    copyGroupBtn.addEventListener("click", () => {
        navigator.clipboard.writeText("978051263").then(() => {
            toast.success("📋 QQ群号 (978051263) 已复制到剪贴板，快去搜群加入吧！");
        }).catch((err) => {
            console.error("Failed to copy group number:", err);
            toast.error("复制失败，请手动选择群号进行复制：978051263");
        });
    });
}

// ==========================================
// 7. QR CODE FULLSCREEN LIGHTBOX CONTROLLER
// ==========================================
const qrLightbox = document.getElementById("qr-lightbox");
const qrLightboxBox = document.getElementById("qr-lightbox-box");
const qrLightboxImg = document.getElementById("qr-lightbox-img");
const qrLightboxTitle = document.getElementById("qr-lightbox-title");
const closeQrLightbox = document.getElementById("close-qr-lightbox");

// Find both QR card clickable triggers
const qrTriggers = document.querySelectorAll(".qr-trigger-card");

function openQrLightbox(src, title) {
    if (qrLightbox && qrLightboxImg && qrLightboxTitle && qrLightboxBox) {
        qrLightboxImg.src = src;
        qrLightboxTitle.textContent = title;
        qrLightbox.classList.remove("opacity-0", "pointer-events-none");
        qrLightboxBox.classList.remove("scale-95");
        qrLightboxBox.classList.add("scale-100");
    }
}

function closeQrLightboxFn() {
    if (qrLightbox && qrLightboxBox) {
        qrLightbox.classList.add("opacity-0", "pointer-events-none");
        qrLightboxBox.classList.remove("scale-100");
        qrLightboxBox.classList.add("scale-95");
    }
}

qrTriggers.forEach(trigger => {
    trigger.addEventListener("click", () => {
        const src = trigger.getAttribute("data-qr-src");
        const title = trigger.getAttribute("data-qr-title");
        openQrLightbox(src, title);
    });
});

if (closeQrLightbox) closeQrLightbox.addEventListener("click", closeQrLightboxFn);
if (qrLightbox) {
    qrLightbox.addEventListener("click", (e) => {
        if (e.target === qrLightbox || e.target.closest("#close-qr-lightbox")) {
            closeQrLightboxFn();
        }
    });
}

// Add Esc key listener to close both modals
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeSupportModalFn();
        closeQrLightboxFn();
    }
});



