// Premium Toast Notification System (Glassmorphic dark theme)

class ToastManager {
    constructor() {
        this.container = null;
        this.initContainer();
    }

    initContainer() {
        if (this.container) return;
        this.container = document.createElement("div");
        this.container.id = "toast-container";
        this.container.className = "fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-[calc(100%-3rem)] pointer-events-none";
        document.body.appendChild(this.container);
    }

    show(message, type = "info", duration = 4000) {
        this.initContainer();

        const toast = document.createElement("div");
        toast.className = `flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 pointer-events-auto transform translate-x-4 opacity-0 max-w-sm ml-auto ${this.getStyles(type)}`;
        
        const icon = this.getIcon(type);
        
        toast.innerHTML = `
            <div class="flex-shrink-0 mt-0.5">${icon}</div>
            <div class="flex-1 text-xs font-medium leading-relaxed">${message.replace(/\n/g, '<br>')}</div>
            <button type="button" class="flex-shrink-0 text-gray-500 hover:text-gray-300 p-0.5 rounded transition-all focus:outline-none cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
            </button>
        `;

        // Bind close button
        toast.querySelector("button").addEventListener("click", () => this.dismiss(toast));

        this.container.appendChild(toast);

        // Trigger entrance animation next tick
        setTimeout(() => {
            toast.classList.remove("translate-x-4", "opacity-0");
            toast.classList.add("translate-x-0", "opacity-100");
        }, 10);

        // Auto dismiss timer
        if (duration > 0) {
            setTimeout(() => this.dismiss(toast), duration);
        }
    }

    dismiss(toast) {
        if (!toast || !toast.parentNode) return;
        toast.classList.remove("translate-x-0", "opacity-100");
        toast.classList.add("translate-x-4", "opacity-0");
        
        toast.addEventListener("transitionend", () => {
            if (toast.parentNode) {
                toast.remove();
            }
        });
    }

    success(message, duration) { this.show(message, "success", duration); }
    error(message, duration) { this.show(message, "error", duration); }
    warning(message, duration) { this.show(message, "warning", duration); }
    info(message, duration) { this.show(message, "info", duration); }

    getStyles(type) {
        switch (type) {
            case "success":
                return "bg-emerald-950/80 border-emerald-500/30 text-emerald-200";
            case "error":
                return "bg-red-950/80 border-red-500/30 text-red-200";
            case "warning":
                return "bg-yellow-950/80 border-yellow-500/30 text-yellow-200";
            case "info":
            default:
                return "bg-slate-900/80 border-blue-500/30 text-blue-200";
        }
    }

    getIcon(type) {
        switch (type) {
            case "success":
                return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`;
            case "error":
                return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-red-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>`;
            case "warning":
                return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`;
            case "info":
            default:
                return `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-blue-400" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`;
        }
    }
}

export const toast = new ToastManager();
