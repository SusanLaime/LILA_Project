// shell.js
// Basic interactivity for LILA MVP

document.addEventListener('DOMContentLoaded', () => {
    // ---------------------------------------------------------
    // Legacy Job Apply Buttons (buscar.html)
    // ---------------------------------------------------------
    const applyButtons = document.querySelectorAll('.aplicar-vendedor, .aplicar-plomero-para');
    
    applyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Check if this is the new <a> tag structure. If it is, let it navigate normally.
            if (this.tagName.toLowerCase() === 'a') {
                return;
            }

            if (this.dataset.applied === "true") return; // Already applied
            
            // Visual feedback
            this.style.backgroundColor = "#4CAF50"; // Green
            this.innerHTML = '<span style="color:white; font-weight:bold;">Aplicado ✓</span>';
            this.dataset.applied = "true";
        });
    });

    // ---------------------------------------------------------
    // Registration Form Routing (register.html)
    // ---------------------------------------------------------
    const registroForm = document.getElementById('registroForm');
    if (registroForm) {
        registroForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const rol = document.getElementById('rol').value;
            
            if (rol === 'trabajador') {
                window.location.href = '../website/trabajador/verificacion.html';
            } else if (rol === 'empleador') {
                window.location.href = '../website/empleador/ofertas.html';
            }
        });
    }

    // ---------------------------------------------------------
    // Login Screen Global Role Router (login.html)
    // ---------------------------------------------------------
    const globalRoleSelect = document.getElementById('global-role');
    const btnCrear = document.getElementById('btn-crear');
    const btnIngresar = document.getElementById('btn-ingresar');
    const btnInvitado = document.getElementById('btn-invitado');

    if (globalRoleSelect) {
        
        // Helper function to route based on the selected role
        const routeToWorkspace = () => {
            const role = globalRoleSelect.value;
            if (role === 'trabajador') {
                window.location.href = '../website/trabajador/buscar.html';
            } else if (role === 'empleador') {
                window.location.href = '../website/empleador/ofertas.html';
            }
        };

        if (btnCrear) {
            btnCrear.addEventListener('click', () => {
                // For MVP, we route everyone to register.html
                // Realistically, you could pass the role in the URL like register.html?role=trabajador
                window.location.href = 'register.html';
            });
        }

        if (btnIngresar) {
            btnIngresar.addEventListener('click', () => {
                // Skips auth for MVP and drops directly into dashboard
                routeToWorkspace();
            });
        }

        if (btnInvitado) {
            btnInvitado.addEventListener('click', () => {
                // Guests also get routed directly to the appropriate workspace
                routeToWorkspace();
            });
        }
    }
});
