# ztt (ZeroTier Tools) 🪐

[中文](./README.md) | English

---

**ztt** (ZeroTier Tools) is a premium, high-performance web-based guided custom tool suite for offline **ZeroTier Planet** network topology configuration generation, customization, signing, and parsing.

Driven by a compiled Go compilation engine running entirely inside the browser's WebAssembly (WASM) sandbox, this tool eliminates the need for complex command-line builds, Go/Rust compiler installations, and security concerns. Everything is executed 100% locally and offline.

### ✨ Key Features

- **🛡️ 100% Client-Side Sandbox**: Built on Go compiled to WebAssembly. All cryptographic calculations, network topology compilation, and parsing happen locally in your browser. No data is sent to external servers.
- **🔄 Bidirectional Compilation**:
  - **Decompile / Decode**: Upload an existing compiled binary `planet` file. The Go WASM compiler will parse it and restore its raw roots topology settings right into the interactive editor.
  - **Compile / Generate**: Interactively edit root servers (roots), stable endpoints (IP/Port), and generate a signed ZeroTier `planet` binary.
- **🔑 Keys & Identity Management**:
  - Drag-and-drop or import an existing `identity.secret` node private key (Curve25519).
  - Generate a secure random node private key dynamically if you don't have one.
  - Safely backup your private key to your device or persist it locally in LocalStorage for revision.
- **💎 Modern Aesthetic Interface**: An interactive, responsive layout using **Vite v5 + Tailwind CSS v4** featuring glowing particle background effects, smooth micro-animations, and full dark-mode optimization.

### 🚀 Quick Start

Ensure you have [Node.js](https://nodejs.org/) installed.

1. **Clone the repository**:
   ```bash
   git clone https://github.com/NONGFAH/ztt.git
   cd ztt
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

### 📁 Project Structure

```text
ztt/
├── public/
│   ├── favicon.svg        # App Favicon
│   ├── qq.jpeg            # QQ Group QR Code
│   ├── zfb.jpeg           # Alipay Donation QR Code
│   ├── wasm_exec.js       # Go WASM bridge adapter
│   └── main.wasm          # Precompiled Go WASM compilation engine
├── src/
│   ├── state.js           # Centralized reactive state store
│   ├── toast.js           # Modern interactive toast notifications
│   ├── uiRenderer.js      # Dynamic UI rendering logic
│   ├── wasmLoader.js      # Self-healing WASM bootstrapper
│   ├── style.css          # Tailwind CSS v4 styles entrypoint
│   └── main.js            # Main application event controller
├── index.html             # UI Structure & layouts
├── package.json           # Project dependencies & scripts
├── vite.config.js         # Vite configuration
└── LICENSE                # MIT License
```

### 💬 Community & Support

- **QQ Community Group**: Scan the QR code below to join our developer and community support group:

  ![QQ Group](public/qq.jpeg)

- **Sponsorship & Donation**: If you find this tool helpful, scan the QR code below to support the developer:

  ![Alipay Donation](public/zfb.jpeg)

### 📝 License

Distributed under the [MIT License](LICENSE).
