import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let model;

let isTrembling = false; // **NOUVEAU :** Variable pour suivre si le tremblement est actif
let tremblingMixer; // **NOUVEAU :** Mixer pour l'animation de tremblement (même si on utilise un effet par code pour l'instant)
let patientTremblingAnimationClip; // **NOUVEAU :** Pour stocker le clip d'animation de tremblement (si vous utilisiez une animation GLTF plus tard)
let initialPatientPosition = new THREE.Vector3(); // **NOUVEAU : Pour stocker la position initiale de la patiente pour le vertige**
let patientStandUpAnimationClip; // **NOUVEAU :** Pour stocker le clip d'animation "se mettre debout"


// Configuration de la caméra
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 1.5, 5); // Position initiale

// Création de la scène
const scene = new THREE.Scene();

// Configuration du rendu
const renderer = new THREE.WebGLRenderer({ antialias: true });

// **CORRECTION IMPORTANTE : Récupérer le conteneur pour Three.js dans le HTML**
const container = document.getElementById('threejs-container');
renderer.setSize(container.offsetWidth, container.offsetHeight); // Définir la taille du renderer en fonction du conteneur
container.appendChild(renderer.domElement); // Ajouter le canvas du renderer au conteneur


// Configuration des contrôles OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;   // Amortissement
controls.dampingFactor = 0.1;
controls.enableZoom = true;     // Zoom activé
controls.enableRotate = true;   // Rotation activée
controls.enablePan = false;      // Désactivation du panoramique

// Gestion du redimensionnement de la fenêtre
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight); // Redimensionner le renderer aussi
});

// Lumières
const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Lumière ambiante générale
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Lumière directionnelle pour un éclairage plus direct
directionalLight.position.set(5, 10, 5); // Position au-dessus et devant le modèle
scene.add(directionalLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 50); // Lumière ponctuelle pour éclairer des zones spécifiques
pointLight.position.set(2, 3, 2); // Place la lumière près du modèle
scene.add(pointLight);

scene.background = new THREE.Color(0xdddddd); // Couleur gris clair pour l'arrière-plan

// Chargement du modèle GLB
const loader = new GLTFLoader();
loader.load(
    '/modele.glb',
    (gltf) => {
        model = gltf.scene;
        scene.add(model);
        model.position.set(0, 0, 0); // Positionne le modèle au centre
        model.scale.set(1, 1, 1); // Ajuste la taille si nécessaire

        // Récupérer le clip d'animation "se mettre debout"
        patientStandUpAnimationClip = gltf.animations.find(clip => clip.name === 'StandUpAnimation'); // **REMPLACEZ 'StandUpAnimation' si votre animation a un nom différent**
        if (!patientStandUpAnimationClip) {
            console.error("Animation 'StandUpAnimation' non trouvée dans le fichier GLTF. Vérifiez le NOM de l'animation dans votre fichier GLTF.");
        } else {
            console.log("Animation 'StandUpAnimation' chargée avec succès.");
        }
    },
    (xhr) => {
        console.log((xhr.loaded / xhr.total * 100) + '% chargé'); // Progrès du chargement
    },
    (error) => {
        console.error('Erreur de chargement du modèle :', error);
    }
);

const cameras = {}; // Variable cameras non utilisée dans le code fourni, peut être supprimée si non utilisée ailleurs

// Écouteur d'événement pour le bouton "Appliquer le symptôme"
document.getElementById("apply-symptom").addEventListener("click", () => {
    const selectedSymptom = document.getElementById("symptom-selector").value;

    if (selectedSymptom) {
        applySymptom(selectedSymptom);
    } else {
        alert("Veuillez sélectionner un symptôme.");
    }
});

// Fonction pour gérer l'application des symptômes
function applySymptom(symptom) {
    switch (symptom) {
        case "mal_tete":
            applyHeadacheEffect();
            break;
        case "douleur_bras":
            applyArmPainEffect(); // Correction : Appel à applyArmPainEffect (nom plus descriptif)
            break;
        case "fievre":
            applyFeverEffect();
            break;
        case "nausee":
            applyNauseaEffect();
            break;
        case "toux":
            applyCoughEffect();
            break;

        case "vertige": // NOUVEAU CAS POUR "vertige"
            applyVertigoSymptom(); // Appeler la fonction applyVertigoSymptom() pour le vertige
            break;
        case "se_lever": // NOUVEAU CAS POUR "se_lever" (Se Mettre Debout)
            applyStandUpSymptom(); // Appeler la fonction pour se mettre debout
            break;
        default:
            console.log("Symptôme inconnu.");
    }
}

// Effet Mal de Tête
let headacheActive = false;
let headacheAnimationId;
let blinkInterval;

function applyHeadacheEffect() {
    headacheActive = true;

    if (model) {
        const head = model.getObjectByName("Ch07_Hair"); // Tête (Nom à vérifier dans votre modèle)
        const eyelashes = model.getObjectByName("Ch07_Eyelashes"); // Cils (Nom à vérifier)

        if (head && eyelashes) {
            console.log("Effet : Mal de tête activé.");

            let angle = 0;
            const rotationSpeed = 0.05;
            const maxRotation = 0.2;

            headacheAnimationId = setInterval(() => {
                angle += rotationSpeed;
                head.rotation.y = Math.sin(angle) * maxRotation;
            }, 16);

            blinkInterval = setInterval(() => {
                eyelashes.visible = !eyelashes.visible;
            }, 300);
        } else {
            console.error("Le modèle ou ses parties ('Ch07_Hair', 'Ch07_Eyelashes') sont introuvables.");
        }
    }
}



// Effet Fièvre
let feverActive = false;
let trembleIntensity = 0.03;
let feverLight;
let initialPosition = new THREE.Vector3();

function applyFeverEffect() {
    feverActive = true;

    if (!feverLight) {
        feverLight = new THREE.HemisphereLight(0xffa500, 0x080808, 0.8);
        scene.add(feverLight);
    }

    if (model) {
        const patient = model.getObjectByName("patient"); // Nom du modèle patient à vérifier
        if (patient) {
            initialPosition.copy(patient.position);
        }
    }
    console.log("Effet : Fièvre activée, la patiente tremble !");
}


function trembleModel() {
    if (model && feverActive) {
        const patient = model.getObjectByName("patient");
        if (patient) {
            const offsetX = (Math.random() - 0.5) * trembleIntensity;
            const offsetZ = (Math.random() - 0.5) * trembleIntensity;

            patient.position.set(
                initialPosition.x + offsetX,
                initialPosition.y,
                initialPosition.z + offsetZ
            );
        } else {
            console.error("Le modèle de la patiente n'a pas été trouvé.");
        }
    }
}




// Effet Nausée/Vertiges
let nauseaActive = false;
let nauseaAnimationId;

function applyNauseaEffect() {
    nauseaActive = true;
    console.log("Effet : Nausée activée.");

    let angle = 0;
    const rotationSpeed = 0.01;
    const maxRotation = 0.02;

    nauseaAnimationId = setInterval(() => {
        angle += rotationSpeed;
        camera.rotation.z = Math.sin(angle) * maxRotation;
    }, 16);
}



// Effet Toux
let coughActive = false;
let coughAnimationId;

function applyCoughEffect() {
    coughActive = true;
    console.log("Effet : Toux activée.");

    if (model) {
        const patient = model.getObjectByName("patient");

        if (patient) {
            // **CORRECTION : Utilisation de "Ch07_Suit" comme partie du thorax (à vérifier avec votre modèle)**
            const thorax = patient.getObjectByName("patient");

            if (thorax) {
                console.log("Partie thorax (Ch07_Suit) trouvée dans 'patient':", thorax);

                let angle = 0.5;
                const coughSpeed = 0.1;
                const maxForwardMovement = 0.05;

                coughAnimationId = setInterval(() => {
                    angle += coughSpeed;
                    thorax.position.z = thorax.position.z + Math.sin(angle) * maxForwardMovement;
                }, 150);
            } else {
                console.error("Partie du modèle 'Ch07_Suit' NON trouvée DANS 'patient'. Vérifiez le nom et la structure.");
            }
        } else {
            console.error("Modèle 'patient' NON trouvé. Assurez-vous que le modèle principal 'patient' est correctement chargé et nommé.");
        }
    }
}



// Effet Douleur au Bras (Correction et Renommage depuis trembleModel1)
let armPainActive = false;
let armPainAnimationId;

function applyArmPainEffect() { // Renommage de la fonction pour plus de clarté
    armPainActive = true;
    console.log("Effet : Douleur au bras activée (tremblement du bras).");

    if (model) {
        const arm = model.getObjectByName("NomDeLaPartieBras"); // **IMPORTANT : Remplacez par le nom réel de la partie du bras**

        if (arm) {
            let trembleAngle = 0;
            const trembleSpeed = 0.2;
            const maxTrembleRotation = 0.1;

            armPainAnimationId = setInterval(() => {
                trembleAngle += trembleSpeed;
                arm.rotation.x = Math.sin(trembleAngle) * maxTrembleRotation;
                arm.rotation.y = Math.cos(trembleAngle * 0.8) * maxTrembleRotation * 0.8;
            }, 16);
        } else {
            console.error("Partie du modèle 'bras' non trouvée.");
        }
    }
}

function stopHeadacheEffect() {
    headacheActive = false;

    // Arrêter les animations
    clearInterval(headacheAnimationId);
    clearInterval(blinkInterval);

    // Réinitialiser les positions et rotations
    if (model) {
        const head = model.getObjectByName("Ch07_Hair");
        const eyelashes = model.getObjectByName("Ch07_Eyelashes");

        if (head && eyelashes) {
            head.rotation.y = 0; // Réinitialise la rotation de la tête
            eyelashes.visible = true; // S'assurer que les cils sont visibles
        }
    }

    console.log("Effet : Mal de tête désactivé.");
}

function stopFeverEffect() {
    feverActive = false;
    if (feverLight) {
        scene.remove(feverLight);
        feverLight = null;
    }
    console.log("Effet : Fièvre désactivée.");
}

function stopNauseaEffect() {
    nauseaActive = false;
    clearInterval(nauseaAnimationId);
    camera.rotation.z = 0; // Réinitialiser la rotation de la caméra
    console.log("Effet : Nausée désactivée.");
}

function stopCoughEffect() {
    coughActive = false;
    clearInterval(coughAnimationId);
    if (model) {
        const thorax = model.getObjectByName("Ch07_Suit");
        if (thorax) {
            thorax.position.z = 0; // Réinitialiser la position Z du thorax
        }
    }
    console.log("Effet : Toux désactivée.");
}

function stopArmPainEffect() {
    armPainActive = false;
    clearInterval(armPainAnimationId);
    if (model && model.getObjectByName("NomDeLaPartieBras")) {
        const arm = model.getObjectByName("NomDeLaPartieBras");
        arm.rotation.set(0, 0, 0); // Réinitialiser la rotation du bras
    }
    console.log("Effet : Douleur au bras désactivée.");
}



function stopArmPainEffect() {
    // ... votre code existant pour stopArmPainEffect() ...
    console.log("Effet : Douleur au bras désactivée.");
}

function stopSymptoms() { // MODIFICATION DE LA FONCTION EXISTANTE
    stopHeadacheEffect();
    stopFeverEffect();
    stopNauseaEffect();
    stopCoughEffect();
    stopArmPainEffect();

    stopTremblingAnimation(); // **NOUVEAU : Arrêter l'animation de tremblement quand on arrête tous les symptômes**
    isTrembling = false; // **NOUVEAU : S'assurer que la variable isTrembling est bien à false**

    document.getElementById("stop-symptoms").style.display = "none";
    console.log("Tous les symptômes arrêtés.");
}
// ══════════════════ NOUVEAU CODE POUR LE VERTIGE ET TREMBLEMENT ══════════════════

function applyVertigoSymptom() {
    if (!model) {
        console.error("Modèle de patiente non chargé.");
        return;
    }

    // **NOUVEAU : Récupérer l'objet "patient"**
    const patient = model.getObjectByName("patient"); // **IMPORTANT : Vérifiez que "patient" est bien le nom de VOTRE objet patiente dans le modèle**

    if (!patient) {
        console.error("Objet 'patient' non trouvé dans le modèle. Vérifiez le nom dans votre modèle 3D.");
        return; // Arrêter la fonction si l'objet patiente n'est pas trouvé
    }

    // **NOUVEAU : Enregistrer la position initiale de la patiente**
    initialPatientPosition.copy(patient.position);


    startCodeTremblingAnimation(); // Utiliser l'effet de tremblement par code
    isTrembling = true;
    console.log("Symptôme : Vertige - Tremblement activé (patiente uniquement).");
}


function startCodeTremblingAnimation() {
    isTrembling = true;
    console.log("Animation de tremblement par code (patiente uniquement) : Démarre.");
}


function applyTremblingEffect() {
    if (isTrembling && model) {
        const tremblementAmplitude = 0.02;

        // **NOUVEAU : Récupérer l'objet "patient" à chaque frame pour s'assurer qu'on travaille sur le bon objet**
        const patient = model.getObjectByName("patient");  // **Encore une fois : Vérifiez que "patient" est le bon nom**

        if (patient) { // **Vérifier si l'objet patient a été trouvé (sécurité)**
            patient.position.x = initialPatientPosition.x + (Math.random() - 0.5) * tremblementAmplitude; // **Utiliser initialPatientPosition.x**
            patient.position.y = initialPatientPosition.y + (Math.random() - 0.5) * tremblementAmplitude; // **Utiliser initialPatientPosition.y**
            patient.position.z = initialPatientPosition.z + (Math.random() - 0.5) * tremblementAmplitude; // **Utiliser initialPatientPosition.z**

            // OPTIONNEL : Rotations aléatoires (à adapter si vous les utilisez - cibler aussi 'patient.rotation' et non 'model.rotation')
            const tremblementRotationAmplitude = 0.01;
            patient.rotation.x += (Math.random() - 0.5) * tremblementRotationAmplitude;
            patient.rotation.y += (Math.random() - 0.5) * tremblementRotationAmplitude;
            patient.rotation.z += (Math.random() - 0.5) * tremblementRotationAmplitude;
        } else {
            console.error("Objet 'patient' non trouvé dans applyTremblingEffect. Vérifiez le nom du modèle."); // Message d'erreur si l'objet patient n'est pas trouvé (encore une sécurité)
        }
    }
}



let isStandingUp = false; // Variable pour suivre l'état de l'animation "se mettre debout"
let standUpMixer; // Mixer pour l'animation "se mettre debout"

function applyStandUpSymptom() {
    if (!model) {
        console.error("Modèle de patiente non chargé.");
        return;
    }
    if (!patientStandUpAnimationClip) {
        console.error("Animation 'se mettre debout' non chargée. Assurez-vous de l'avoir chargée dans loadPatientModel().");
        return;
    }

    startPatientStandUpAnimation();
    isStandingUp = true; // Indiquer que l'animation est active
    console.log("Symptôme : Se mettre debout activé.");
}

function startPatientStandUpAnimation() {
    if (!model || !patientStandUpAnimationClip) {
        console.error("Modèle ou animation 'se mettre debout' non chargé.");
        return;
    }

    if (!standUpMixer) {
        standUpMixer = new THREE.AnimationMixer(model);
    }

    const standUpAction = standUpMixer.clipAction(patientStandUpAnimationClip);
    standUpAction.reset().play(); // Démarrer l'animation "se mettre debout"
    isStandingUp = true; // S'assurer que la variable de suivi est à true
    console.log("Animation 'se mettre debout' : Démarrée.");
}

function stopPatientStandUpAnimation() { // Fonction pour ARRETER l'animation (pas forcément nécessaire immédiatement)
    if (standUpMixer && standUpMixer.clipAction(patientStandUpAnimationClip)) {
        standUpMixer.clipAction(patientStandUpAnimationClip).stop();
        isStandingUp = false;
        console.log("Animation 'se mettre debout' : Arrêtée.");
    }
}



// Boucle d'animation
function animate() {
    requestAnimationFrame(animate);

    
    trembleModel();
    if (standUpMixer && isStandingUp) {
        standUpMixer.update(clock.getDelta());
    }

    if (isTrembling && model) { 
        applyTremblingEffect();
    }

    controls.update(); // Mise à jour des contrôles OrbitControls
    renderer.render(scene, camera); // Rendu de la scène
}

animate();