// ui.js

document.addEventListener('DOMContentLoaded', () => {
    const simulationLink = document.querySelector('.nav-item.has-submenu > .nav-link[href="#"]'); // Lien "Simulation"
    const simulationSubmenu = document.getElementById('simulation-submenu'); // Sous-menu "Simulation"
    const themeLink = document.getElementById('theme-link');

    const chatIcon = document.getElementById('chat-icon');
    const chatWindow = document.getElementById('chat-window');
    const chatCloseButton = document.getElementById('chat-close-button');

    const chatBody = document.getElementById('chat-body'); // Corps du chat pour ajouter les messages
    const messageInput = document.getElementById('message-input'); // Champ de saisie du message
    const sendButton = document.getElementById('send-button'); // Bouton "Envoyer"


    // const themeLink = document.querySelector('.nav-item.has-submenu > .nav-link'); // Sélecteur plus simple pour le lien "Thème"
    // const themeLink = document.querySelector('.nav-item.has-submenu > .nav-link:not([href="#"])'); // Lien "Thème" (ajustez le sélecteur si nécessaire pour être plus précis)
    const themeSubmenu = document.getElementById('theme-submenu'); // Sous-menu "Thème"
    const themeStyleLink = document.getElementById('theme-style'); // Lien CSS du thème actuel
    const themeClairLink = document.getElementById('theme-clair-link'); // Lien "Thème Clair" dans le submenu
    const themeSombreLink = document.getElementById('theme-sombre-link'); // Lien "Thème Sombre" dans le submenu
    const symptomSelectionLink = document.getElementById('symptom-selection-link'); // Lien "Sélection des Symptômes"
    const simulationPanel = document.getElementById('simulation-panel'); // Panneau de sélection des symptômes
    const stopSymptomsButton = document.getElementById('stop-symptoms'); // Bouton "Arrêter les Symptômes"
    const applySymptomButton = document.getElementById('apply-symptom'); // Bouton "Appliquer le Symptôme"

    let currentTheme = localStorage.getItem('theme') || 'clair'; // Thème par défaut : clair, récupère la préférence de localStorage


     // Fonction pour appliquer un thème
     function setTheme(themeName) {
        if (themeName === 'sombre') {
            themeStyleLink.href = 'theme-sombre.css';
        } else {
            themeStyleLink.href = 'theme-clair.css';
        }
        localStorage.setItem('theme', themeName);
        currentTheme = themeName;
    }


    // **Gestion de l'ouverture/fermeture du chat**

    if (chatIcon && chatWindow && chatCloseButton) { // Vérifier que les éléments existent
        // Écouteur d'événement pour l'icône du chat (ouvrir/fermer la fenêtre)
        chatIcon.addEventListener('click', () => {
            chatWindow.style.display = (chatWindow.style.display === 'block') ? 'none' : 'block';
        });

        // Écouteur d'événement pour le bouton "X" (fermer la fenêtre)
        chatCloseButton.addEventListener('click', () => {
            chatWindow.style.display = 'none'; // Fermer la fenêtre de chat
        });
    }


    // **Gestion de l'envoi des messages et des réponses**

    if (sendButton && messageInput && chatBody) { // Vérifier que les éléments existent
        sendButton.addEventListener('click', () => {
            const messageText = messageInput.value; // Récupérer le texte du message
            if (messageText.trim() !== "") { // Vérifier que le message n'est pas vide

                // 1. Afficher le message du patient dans le chat (côté "envoyé")
                displayMessage(messageText, 'sent');

                // 2. Obtenir une réponse du "Dr. Virtuel" (fonction de réponse instantanée)
                const responseText = getInstantResponse(messageText);

                // 3. Afficher la réponse du "Dr. Virtuel" dans le chat (côté "reçu") après un court délai (pour simuler le temps de réponse)
                setTimeout(() => {
                    displayMessage(responseText, 'received');
                }, 500); // Délai de 500ms (0.5 seconde) - ajustez si vous voulez un délai plus long ou plus court

                // 4. Effacer le champ de saisie
                messageInput.value = "";
            }
        });

        // Gestion de l'envoi du message avec la touche "Entrée" (optionnel, mais améliore l'UX)
        messageInput.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Empêcher le comportement par défaut de "Enter" dans un input (soumission de formulaire)
                sendButton.click(); // Simuler un clic sur le bouton "Envoyer"
            }
        });
    }


    // **Fonction pour afficher un message dans le chat**
    function displayMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message'); // Classe de base pour tous les messages
        if (type === 'sent') {
            messageDiv.classList.add('message-sent'); // Classe pour les messages envoyés par le patient
        } else {
            messageDiv.classList.add('message-received'); // Classe pour les messages reçus du médecin
        }
        const messageParagraph = document.createElement('p');
        messageParagraph.textContent = text;
        messageDiv.appendChild(messageParagraph);
        chatBody.appendChild(messageDiv);

        // Faire défiler automatiquement le chat vers le bas pour voir le nouveau message
        chatBody.scrollTop = chatBody.scrollHeight;
    }


    // **Fonction pour obtenir une réponse instantanée du "Dr. Virtuel"**
    function getInstantResponse(userMessage) {
        const lowerCaseMessage = userMessage.toLowerCase(); // Convertir le message utilisateur en minuscules pour la comparaison

        if (lowerCaseMessage.includes("consultation") || lowerCaseMessage.includes("rdv") || lowerCaseMessage.includes("rendez-vous")) {
            return "Bienvenue ! Ravi de vous voir. Quel est le motif de votre consultation aujourd'hui ?";
        } else if (lowerCaseMessage.includes("bonjour") || lowerCaseMessage.includes("salut") || lowerCaseMessage.includes("coucou")) {
            return "Bonjour ! Comment allez-vous aujourd'hui ?";
        } else if (lowerCaseMessage.includes("merci") || lowerCaseMessage.includes("remerciements")) {
            return "De rien ! N'hésitez pas si vous avez d'autres questions.";
        } else if (lowerCaseMessage.includes("au revoir") || lowerCaseMessage.includes("a plus") || lowerCaseMessage.includes("bonne journée")) {
            return "Au revoir, et prenez soin de vous !";
        } else if (lowerCaseMessage.includes("symptôme") || lowerCaseMessage.includes("symptomes")) {
            return "Je suis là pour vous aider à explorer vos symptômes. Veuillez les décrire.";
        }
        
        // Ajoutez d'autres conditions "else if" pour d'autres mots-clés et réponses possibles

        // Réponse par défaut si aucun mot-clé n'est détecté
        return "Je comprends. Veuillez m'en dire plus.";
    }




    // Appliquer le thème initial au chargement
    setTheme(currentTheme);

    // Écouteur d'événement pour le lien "Thème" (ouvrir/fermer le sous-menu)
    if (themeLink && themeSubmenu) {
        themeLink.addEventListener('click', (event) => {
            event.preventDefault();
            themeSubmenu.style.display = (themeSubmenu.style.display === 'block') ? 'none' : 'block';
        });
    }

    // Écouteur d'événement pour le lien "Thème Clair"
    if (themeClairLink) {
        themeClairLink.addEventListener('click', (event) => {
            event.preventDefault();
            setTheme('clair');
            themeSubmenu.style.display = 'none'; // Fermer le sous-menu après sélection
        });
    }

    // Écouteur d'événement pour le lien "Thème Sombre"
    if (themeSombreLink) {
        themeSombreLink.addEventListener('click', (event) => {
            event.preventDefault();
            setTheme('sombre');
            themeSubmenu.style.display = 'none'; // Fermer le sous-menu après sélection
        });
    }



    // Gestion du clic sur "Simulation" pour afficher/masquer le sous-menu (optionnel - si vous voulez des sous-menus déroulants)
    if (simulationLink && simulationSubmenu) { // Vérifier si les éléments existent avant d'ajouter l'écouteur
        simulationLink.addEventListener('click', (event) => {
            event.preventDefault(); // Empêcher le lien de naviguer (si href="#" est utilisé)
            simulationSubmenu.style.display = simulationSubmenu.style.display === 'block' ? 'none' : 'block';
            themeSubmenu.style.display = 'none'; // Fermer l'autre sous-menu si ouvert
        });
    }



    // Gestion du clic sur "Sélection des Symptômes" pour afficher le panneau des symptômes
    if (symptomSelectionLink && simulationPanel) {
        symptomSelectionLink.addEventListener('click', (event) => {
            event.preventDefault();
            simulationPanel.style.display = 'block'; // Afficher le panneau
            simulationSubmenu.style.display = 'none'; // Fermer le sous-menu "Simulation" si ouvert
        });
    }


     // Gestion du clic sur "Appliquer le symptôme" (example - adapter à votre logique de code)
    if (applySymptomButton && stopSymptomsButton) { // Vérifier que les boutons existent
        applySymptomButton.addEventListener('click', () => {
            // ... votre code pour appliquer le symptôme (déjà dans votre index.js) ...
            stopSymptomsButton.style.display = 'inline-block'; // Afficher le bouton "Arrêter" après avoir appliqué un symptôme
            applySymptomButton.style.display = 'none'; // Cacher le bouton "Appliquer" après application (optionnel)
        });

         // Gestion du clic sur "Arrêter les symptômes" (example - adapter à votre logique de code)
        stopSymptomsButton.addEventListener('click', () => {
            // ... votre code pour arrêter les symptômes (fonctions stopHeadacheEffect(), stopFeverEffect(), etc. à créer) ...
            stopSymptomsButton.style.display = 'none'; // Cacher le bouton "Arrêter" après avoir arrêté les symptômes
            applySymptomButton.style.display = 'inline-block'; // Réafficher le bouton "Appliquer"
            simulationPanel.style.display = 'none'; // Optionnel: Cacher le panneau des symptômes après arrêt
        });
    }


    // Fermer les sous-menus si on clique en dehors du menu (optionnel)
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.nav-item.has-submenu')) { // Si le clic n'est pas dans un élément de menu avec sous-menu
            simulationSubmenu.style.display = 'none';
            themeSubmenu.style.display = 'none';
        }
    });
});

// ... dans ui.js ...

const stopSymptomsButton = document.getElementById('stop-symptoms'); // Bouton "Arrêter les Symptômes"
const applySymptomButton = document.getElementById('apply-symptom'); // Bouton "Appliquer le Symptôme"

if (applySymptomButton && stopSymptomsButton) {
    applySymptomButton.addEventListener('click', () => {
        // ... votre code pour appliquer le symptôme ...
        stopSymptomsButton.style.display = 'inline-block';
        applySymptomButton.style.display = 'none';
    });

    stopSymptomsButton.addEventListener('click', () => {
        // ... votre code pour arrêter les symptômes ...
        stopSymptomsButton.style.display = 'none';
        applySymptomButton.style.display = 'inline-block';
        simulationPanel.style.display = 'none'; // Optionnel: Cacher le panneau des symptômes après arrêt
    });
}
// ui.js

// ... (le reste de votre code ui.js, récupération des éléments HTML, etc.) ...

const symptomSelector = document.getElementById('symptom-selector'); // Sélection des symptômes

if (applySymptomButton && stopSymptomsButton) {
    applySymptomButton.addEventListener('click', () => {
        const selectedSymptom = symptomSelector.value; // Récupérer le symptôme sélectionné ici aussi si nécessaire
        // **Important :**  Appeler applySymptom depuis ui.js, ou déplacer la logique d'application dans ui.js
        // Exemple (si applySymptom est définie dans index.js et accessible globalement) :
        applySymptom(selectedSymptom);

        stopSymptomsButton.style.display = 'inline-block';
        applySymptomButton.style.display = 'none';
    });

    stopSymptomsButton.addEventListener('click', () => {
        // **Appeler toutes les fonctions stop...Effect() pour arrêter tous les symptômes**
        stopHeadacheEffect();   // Arrêter l'effet Mal de tête
        stopFeverEffect();      // Arrêter l'effet Fièvre
        stopNauseaEffect();     // Arrêter l'effet Nausée
        stopCoughEffect();      // Arrêter l'effet Toux
        stopArmPainEffect();   // Arrêter l'effet Douleur au bras

        // Réinitialiser la sélection du symptôme (optionnel)
        symptomSelector.value = ""; // Remettre la sélection à "Sélectionner un symptôme"

        stopSymptomsButton.style.display = 'none';
        applySymptomButton.style.display = 'inline-block';
        simulationPanel.style.display = 'none'; // Optionnel: Cacher le panneau des symptômes après arrêt
    });
}

// ... (le reste de votre code ui.js) ...