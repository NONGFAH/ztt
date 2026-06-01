// Central reactive state management for zeroGuard Planet Wizard

export const state = {
    currentStep: 1,
    selectedSecretKey: null, // Hex secret key in memory
    configData: {
        id: 88888888,
        worldType: "planet",
        roots: [] // Array of { identity, stableEndpoints }
    },
    
    listeners: [],
    
    // Subscribe to state change notifications
    subscribe(callback) {
        this.listeners.push(callback);
    },
    
    // Notify all listeners of state changes
    notify() {
        this.listeners.forEach(cb => cb(this));
    },

    mutations: {
        setStep(step) {
            if (step < 1 || step > 4) return;
            state.currentStep = step;
            state.notify();
        },
        
        setSecretKey(hexKey) {
            state.selectedSecretKey = hexKey;
            state.notify();
        },
        
        setConfigData(newData) {
            if (newData) {
                state.configData.id = typeof newData.id === "number" ? newData.id : state.configData.id;
                state.configData.worldType = newData.worldType || state.configData.worldType;
                
                if (Array.isArray(newData.roots)) {
                    state.configData.roots = newData.roots.slice(0, 4).map(root => {
                        let endpoints = [];
                        if (Array.isArray(root.stableEndpoints)) {
                            endpoints = root.stableEndpoints.slice(0, 32).map(e => e.trim()).filter(e => e !== "");
                        }
                        return {
                            identity: root.identity ? root.identity.trim() : "",
                            stableEndpoints: endpoints
                        };
                    });
                }
            }
            state.notify();
        },
        
        setWorldId(id) {
            state.configData.id = id;
            state.notify();
        },
        
        addRoot() {
            if (state.configData.roots.length >= 4) return false;
            state.configData.roots.push({ identity: "", stableEndpoints: [] });
            state.notify();
            return true;
        },
        
        removeRoot(index) {
            if (index >= 0 && index < state.configData.roots.length) {
                state.configData.roots.splice(index, 1);
                state.notify();
                return true;
            }
            return false;
        },
        
        updateRootIdentity(index, identity) {
            if (index >= 0 && index < state.configData.roots.length) {
                state.configData.roots[index].identity = identity;
                // No notify here to prevent full redraw and input focus loss during keystroke.
                // Callers will commit or handle drawing of local elements.
            }
        },
        
        addEndpoint(rootIndex, ipPort) {
            if (rootIndex >= 0 && rootIndex < state.configData.roots.length) {
                const root = state.configData.roots[rootIndex];
                if (root.stableEndpoints.length >= 32) return false;
                if (!root.stableEndpoints.includes(ipPort)) {
                    root.stableEndpoints.push(ipPort);
                    state.notify();
                    return true;
                }
            }
            return false;
        },
        
        removeEndpoint(rootIndex, epIndex) {
            if (rootIndex >= 0 && rootIndex < state.configData.roots.length) {
                const root = state.configData.roots[rootIndex];
                if (epIndex >= 0 && epIndex < root.stableEndpoints.length) {
                    root.stableEndpoints.splice(epIndex, 1);
                    state.notify();
                    return true;
                }
            }
            return false;
        }
    }
};
