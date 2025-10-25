// Referencias del DOM
const btn = document.getElementById("addBolson");
const newGroupBtn = document.getElementById("newGroup");
const groupsContainer = document.getElementById("groups");

const totalCounter = document.getElementById("total");
const maizCounter = document.getElementById("maiz");
const sojaCounter = document.getElementById("soja");

const extraidosCounter = document.getElementById("extraidos");
const extraMaizCounter = document.getElementById("extraMaiz");
const extraSojaCounter = document.getElementById("extraSoja");

const modal = document.getElementById("modal");
const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");

const confirmModal = document.getElementById("confirmModal");
const confirmDeleteBtn = document.getElementById("confirmDelete");
const cancelDeleteBtn = document.getElementById("cancelDelete");
const confirmText = document.getElementById("confirmText");

const resetBtn = document.getElementById("resetAll");

// Estado
let selectedTipo = null;
let currentGroup = null;
let groupCount = 0;
let bolsonToDelete = null;

// Utilidades
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function closeModal() {
  modal.style.display = "none";
  step1.style.display = "flex";
  step2.style.display = "none";
  selectedTipo = null;
}

// Crear un nuevo grupo y setear currentGroup
function createNewGroup() {
  groupCount++;
  const groupDiv = document.createElement("div");
  groupDiv.classList.add("group");

  const title = document.createElement("h4");
  title.textContent = `Grupo ${groupCount}`;
  groupDiv.appendChild(title);

  const grid = document.createElement("div");
  grid.classList.add("grid");
  groupDiv.appendChild(grid);

  groupsContainer.appendChild(groupDiv);
  currentGroup = grid;
}

// Inicial: primer grupo y cargar estado
createNewGroup();
loadState();

// Abrir modal de agregar bolsón
btn.addEventListener("click", () => {
  modal.style.display = "flex";
  step1.style.display = "flex";
  step2.style.display = "none";
  selectedTipo = null;
});

// Crear nuevo grupo manualmente
newGroupBtn.addEventListener("click", () => {
  createNewGroup();
  saveState();
});

// Selección de tipo (paso 1)
step1.querySelectorAll("button").forEach(b => {
  b.addEventListener("click", () => {
    selectedTipo = b.dataset.tipo;
    step1.style.display = "none";
    step2.style.display = "flex";
  });
});

// Selección de condición (paso 2) y creación del bolsón
step2.querySelectorAll("button").forEach(b => {
  b.addEventListener("click", () => {
    const condicion = b.dataset.cond;
    if (!selectedTipo) return;

    // Si el grupo actual está lleno (16), crear uno nuevo
    if (currentGroup.children.length >= 16) {
      createNewGroup();
    }

    // Crear bolsón
    const bolsonDiv = document.createElement("div");
    bolsonDiv.classList.add("bolson", selectedTipo);

    // Número secuencial según totales
    const numero = parseInt(totalCounter.textContent, 10) + 1;

    // Botón eliminar con confirmación
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("delete-btn");
    deleteBtn.textContent = "🗑️";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      bolsonToDelete = bolsonDiv;
      confirmText.textContent = `¿Eliminar ${selectedTipo === "maiz" ? "🌽 Maíz" : "🌱 Soja"} #${numero}?`;
      confirmModal.style.display = "flex";
    });

    // Imagen y etiqueta
    const img = document.createElement("img");
    img.src = "bolson.jpg";
    img.alt = `Bolsón de ${selectedTipo} (${condicion})`;

    const label = document.createElement("p");
    const icon = selectedTipo === "maiz" ? "🌽" : "🌱";
    label.textContent = `${icon} #${numero} - ${capitalize(selectedTipo)} ${capitalize(condicion)}`;

    // Ensamblar bolsón
    bolsonDiv.appendChild(deleteBtn);
    bolsonDiv.appendChild(img);
    bolsonDiv.appendChild(label);

    // Click para marcar extraído (❌)
    bolsonDiv.addEventListener("click", () => {
      bolsonDiv.classList.toggle("marked");
      updateExtractedCounters();
      saveState();
    });

    // Insertar en grupo
    currentGroup.appendChild(bolsonDiv);

    // Actualizar contadores globales
    totalCounter.textContent = numero;
    if (selectedTipo === "maiz") {
      maizCounter.textContent = parseInt(maizCounter.textContent, 10) + 1;
    } else {
      sojaCounter.textContent = parseInt(sojaCounter.textContent, 10) + 1;
    }

    // Guardar y cerrar
    updateExtractedCounters();
    saveState();
    closeModal();
  });
});

// Confirmar eliminación de bolsón
confirmDeleteBtn.addEventListener("click", () => {
  if (bolsonToDelete) {
    // Ajustar contadores
    totalCounter.textContent = Math.max(0, parseInt(totalCounter.textContent, 10) - 1);
    if (bolsonToDelete.classList.contains("maiz")) {
      maizCounter.textContent = Math.max(0, parseInt(maizCounter.textContent, 10) - 1);
    } else {
      sojaCounter.textContent = Math.max(0, parseInt(sojaCounter.textContent, 10) - 1);
    }

    // Eliminar del DOM
    const parentGrid = bolsonToDelete.parentElement;
    bolsonToDelete.remove();
    bolsonToDelete = null;

    // Si el grupo quedó vacío, opcionalmente eliminar el grupo completo
    if (parentGrid && parentGrid.classList.contains("grid") && parentGrid.children.length === 0) {
      const group = parentGrid.parentElement;
      if (group && group.classList.contains("group")) {
        group.remove();
        // Reasignar currentGroup al último grid existente
        const grids = groupsContainer.querySelectorAll(".grid");
        currentGroup = grids.length ? grids[grids.length - 1] : null;
      }
    }

    updateExtractedCounters();
    saveState();
  }
  confirmModal.style.display = "none";
});

// Cancelar eliminación
cancelDeleteBtn.addEventListener("click", () => {
  bolsonToDelete = null;
  confirmModal.style.display = "none";
});

// Cerrar modales al click fuera
window.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
  if (e.target === confirmModal) {
    bolsonToDelete = null;
    confirmModal.style.display = "none";
  }
});

// Reiniciar con confirmación (discreto en footer)
resetBtn.addEventListener("click", () => {
  if (confirm("¿Seguro que deseas reiniciar todo? Se borrarán todos los bolsones y grupos.")) {
    localStorage.removeItem("bolsonesData");
    location.reload();
  }
});

// Actualizar contadores de extraídos
function updateExtractedCounters() {
  const marked = document.querySelectorAll(".bolson.marked");
  extraidosCounter.textContent = marked.length;

  const markedMaiz = document.querySelectorAll(".bolson.marked.maiz");
  const markedSoja = document.querySelectorAll(".bolson.marked.soja");
  extraMaizCounter.textContent = markedMaiz.length;
  extraSojaCounter.textContent = markedSoja.length;
}

// Guardar estado en localStorage
function saveState() {
  const data = {
    total: totalCounter.textContent,
    maiz: maizCounter.textContent,
    soja: sojaCounter.textContent,
    extraidos: extraidosCounter.textContent,
    extraMaiz: extraMaizCounter.textContent,
    extraSoja: extraSojaCounter.textContent,
    groups: []
  };

  // Recorrer grupos y bolsones
  groupsContainer.querySelectorAll(".group").forEach(group => {
    const bolsones = [];
    group.querySelectorAll(".bolson").forEach(b => {
      bolsones.push({
        tipo: b.classList.contains("maiz") ? "maiz" : "soja",
        marcado: b.classList.contains("marked"),
        texto: b.querySelector("p") ? b.querySelector("p").textContent : ""
      });
    });
    data.groups.push(bolsones);
  });

  localStorage.setItem("bolsonesData", JSON.stringify(data));
}

// Cargar estado desde localStorage
function loadState() {
  const saved = localStorage.getItem("bolsonesData");
  if (!saved) return;

  const data = JSON.parse(saved);

  // Setear contadores
  totalCounter.textContent = data.total || "0";
  maizCounter.textContent = data.maiz || "0";
  sojaCounter.textContent = data.soja || "0";
  extraidosCounter.textContent = data.extraidos || "0";
  extraMaizCounter.textContent = data.extraMaiz || "0";
  extraSojaCounter.textContent = data.extraSoja || "0";

  // Limpiar grupos existentes y reiniciar contador
  groupsContainer.innerHTML = "";
  groupCount = 0;

  // Reconstruir grupos y bolsones
  (data.groups || []).forEach(bolsones => {
    createNewGroup();
    bolsones.forEach(b => {
      const bolsonDiv = document.createElement("div");
      bolsonDiv.classList.add("bolson", b.tipo);
      if (b.marcado) bolsonDiv.classList.add("marked");

      const deleteBtn = document.createElement("button");
      deleteBtn.classList.add("delete-btn");
      deleteBtn.textContent = "🗑️";
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        bolsonToDelete = bolsonDiv;
        confirmText.textContent = `¿Eliminar ${b.tipo === "maiz" ? "🌽 Maíz" : "🌱 Soja"}?`;
        confirmModal.style.display = "flex";
      });

      const img = document.createElement("img");
      img.src = "bolson.png";
      img.alt = `Bolsón de ${b.tipo}`;

      const label = document.createElement("p");
      label.textContent = b.texto || "";

      bolsonDiv.appendChild(deleteBtn);
      bolsonDiv.appendChild(img);
      bolsonDiv.appendChild(label);

      bolsonDiv.addEventListener("click", () => {
        bolsonDiv.classList.toggle("marked");
        updateExtractedCounters();
        saveState();
      });

      currentGroup.appendChild(bolsonDiv);
    });
  });

  // Reasignar currentGroup al último grid si existe
  const grids = groupsContainer.querySelectorAll(".grid");
  currentGroup = grids.length ? grids[grids.length - 1] : null;

  updateExtractedCounters();
}

