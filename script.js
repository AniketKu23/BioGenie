// Tab switching
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const tabId = tab.getAttribute("data-tab");
    showTab(tabId);
  });
});

function showTab(tabId) {
  // Update tabs
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add("active");

  // Update content sections
  document
    .querySelectorAll(".content-section")
    .forEach((s) => s.classList.remove("active"));
  document.getElementById(tabId).classList.add("active");
}

// Charts
let proteinChart, gcChart;

// Protein Lookup
function lookupProtein() {
  const proteinId = document.getElementById("proteinId").value || "P69905";
  document.getElementById("proteinOutput").textContent = "Loading...";

  fetch(`https://rest.uniprot.org/uniprotkb/${proteinId}.json`)
    .then((res) => res.json())
    .then((data) => {
      const protein_name =
        data.proteinDescription?.recommendedName?.fullName?.value || "N/A";
      const seq_length = data.sequence?.length || "N/A";
      const mol_weight = data.sequence?.molWeight || "N/A";
      const gene_name = data.genes?.[0]?.geneName?.value || "N/A";
      const organism = data.organism?.scientificName || "N/A";

      const output = {
        protein_id: proteinId,
        protein_name,
        gene_name,
        organism,
        sequence_length: seq_length,
        molecular_weight: mol_weight,
      };

      document.getElementById("proteinOutput").textContent = JSON.stringify(
        output,
        null,
        2
      );

      const ctx = document.getElementById("proteinChart").getContext("2d");
      if (proteinChart) proteinChart.destroy();

      proteinChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: [
            protein_name.substring(0, 20) +
              (protein_name.length > 20 ? "..." : ""),
          ],
          datasets: [
            {
              label: "Sequence Length",
              data: [seq_length],
              backgroundColor: "#3498db",
              borderColor: "#2980b9",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: "Protein Sequence Length",
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Amino Acids",
              },
            },
          },
        },
      });
    })
    .catch((err) => {
      document.getElementById("proteinOutput").textContent = "Error: " + err;
    });
}

// DNA/RNA Analysis
const codonTable = {
  TTT: "F",
  TTC: "F",
  TTA: "L",
  TTG: "L",
  CTT: "L",
  CTC: "L",
  CTA: "L",
  CTG: "L",
  ATT: "I",
  ATC: "I",
  ATA: "I",
  ATG: "M",
  GTT: "V",
  GTC: "V",
  GTA: "V",
  GTG: "V",
  TCT: "S",
  TCC: "S",
  TCA: "S",
  TCG: "S",
  CCT: "P",
  CCC: "P",
  CCA: "P",
  CCG: "P",
  ACT: "T",
  ACC: "T",
  ACA: "T",
  ACG: "T",
  GCT: "A",
  GCC: "A",
  GCA: "A",
  GCG: "A",
  TAT: "Y",
  TAC: "Y",
  TAA: "*",
  TAG: "*",
  CAT: "H",
  CAC: "H",
  CAA: "Q",
  CAG: "Q",
  AAT: "N",
  AAC: "N",
  AAA: "K",
  AAG: "K",
  GAT: "D",
  GAC: "D",
  GAA: "E",
  GAG: "E",
  TGT: "C",
  TGC: "C",
  TGA: "*",
  TGG: "W",
  CGT: "R",
  CGC: "R",
  CGA: "R",
  CGG: "R",
  AGT: "S",
  AGC: "S",
  AGA: "R",
  AGG: "R",
  GGT: "G",
  GGC: "G",
  GGA: "G",
  GGG: "G",
};

function translateDNA(seq) {
  seq = seq.toUpperCase().replace(/[^ATGC]/g, "");
  let protein = "";
  for (let i = 0; i + 2 < seq.length; i += 3) {
    protein += codonTable[seq.substr(i, 3)] || "?";
  }
  return protein;
}

function analyzeDNA() {
  const seq = (
    document.getElementById("dnaSequence").value || "ATGCGTAC"
  ).toUpperCase();
  document.getElementById("dnaOutput").textContent = "Analyzing...";

  // Simulate processing time for better UX
  setTimeout(() => {
    const revComp = seq
      .split("")
      .reverse()
      .map((n) => ({ A: "T", T: "A", G: "C", C: "G" }[n] || n))
      .join("");

    const gcContent = (
      ((seq.match(/[GC]/g) || []).length / seq.length) *
      100
    ).toFixed(2);
    const transcription = seq.replace(/T/g, "U");
    const translation = translateDNA(seq);

    const output = {
      input_sequence: seq,
      reverse_complement: revComp,
      GC_content: gcContent + "%",
      transcription,
      translation,
    };

    document.getElementById("dnaOutput").textContent = JSON.stringify(
      output,
      null,
      2
    );

    const ctx = document.getElementById("gcChart").getContext("2d");
    if (gcChart) gcChart.destroy();

    gcChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: ["GC Content", "AT Content"],
        datasets: [
          {
            data: [gcContent, 100 - gcContent],
            backgroundColor: ["#3498db", "#e74c3c"],
            borderColor: ["#2980b9", "#c0392b"],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: "bottom",
          },
          title: {
            display: true,
            text: "GC Content Analysis",
          },
        },
      },
    });
  }, 500);
}

// Network Drawing Helper
function drawNetwork(ctx, nodes, edges, hoveredNode = null) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // Draw edges
  edges.forEach((e) => {
    const from = nodes.find((n) => n.id === e.from);
    const to = nodes.find((n) => n.id === e.to);
    ctx.strokeStyle = "#95a5a6";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  });

  // Draw nodes
  nodes.forEach((n) => {
    ctx.fillStyle = n.fixed ? "#3498db" : "#e74c3c";
    ctx.beginPath();
    ctx.arc(n.x, n.y, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#2c3e50";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "white";
    ctx.font = "bold 10px Arial";
    ctx.textAlign = "center";
    ctx.fillText(n.id.substring(0, 5), n.x, n.y + 4);
  });

  // Draw hover info
  if (hoveredNode) {
    ctx.fillStyle = "rgba(44, 62, 80, 0.9)";
    ctx.fillRect(
      hoveredNode.x + 20,
      hoveredNode.y - 15,
      hoveredNode.id.length * 6 + 10,
      20
    );

    ctx.fillStyle = "white";
    ctx.font = "12px Arial";
    ctx.fillText(hoveredNode.id, hoveredNode.x + 25, hoveredNode.y);
  }
}

// Pathway Lookup
function lookupPathway() {
  const proteinId = document.getElementById("pathwayProtein").value || "P69905";
  document.getElementById("pathwayOutput").textContent = "Loading...";

  fetch(`https://string-db.org/api/json/network?identifiers=${proteinId}`)
    .then((res) => res.json())
    .then((data) => {
      const interactions = data.slice(0, 5).map((d) => d.stringId_B);
      document.getElementById("pathwayOutput").textContent = JSON.stringify(
        { protein_id: proteinId, interactions },
        null,
        2
      );

      const canvas = document.getElementById("interactionNetwork");
      const ctx = canvas.getContext("2d");

      // Set appropriate canvas size
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = 300;

      let nodes = [
        {
          id: proteinId,
          x: canvas.width / 2,
          y: canvas.height / 2,
          fixed: true,
        },
      ];
      nodes.push(
        ...interactions.map((p) => ({
          id: p,
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          fixed: false,
        }))
      );

      let edges = interactions.map((p) => ({ from: proteinId, to: p }));

      function simulate() {
        nodes.forEach((a) => {
          if (a.fixed) return;
          let fx = 0,
            fy = 0;

          nodes.forEach((b) => {
            if (a === b) return;
            let dx = a.x - b.x,
              dy = a.y - b.y,
              dist = Math.sqrt(dx * dx + dy * dy),
              rep = 100 / dist;
            fx += (dx / dist) * rep;
            fy += (dy / dist) * rep;
          });

          edges.forEach((e) => {
            if (e.from === a.id || e.to === a.id) {
              let b = nodes.find(
                (n) => n.id === (e.from === a.id ? e.to : e.from)
              );
              let dx = b.x - a.x,
                dy = b.y - a.y;
              fx += dx * 0.01;
              fy += dy * 0.01;
            }
          });

          // Boundary constraints
          if (a.x < 20) fx += 5;
          if (a.x > canvas.width - 20) fx -= 5;
          if (a.y < 20) fy += 5;
          if (a.y > canvas.height - 20) fy -= 5;

          a.x += fx * 0.5;
          a.y += fy * 0.5;
        });

        drawNetwork(ctx, nodes, edges);
        requestAnimationFrame(simulate);
      }

      simulate();

      canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left,
          my = e.clientY - rect.top;

        let hovered = nodes.find(
          (n) => Math.sqrt((n.x - mx) ** 2 + (n.y - my) ** 2) < 15
        );
        drawNetwork(ctx, nodes, edges, hovered);
      });
    })
    .catch((err) => {
      document.getElementById("pathwayOutput").textContent = "Error: " + err;
    });
}

// Drug Discovery
function lookupDrug() {
  const query = document.getElementById("drugProtein").value || "Hydroxyurea";
  document.getElementById("drugOutput").textContent = "Loading...";

  fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${query}/JSON`)
    .then((res) => res.json())
    .then((data) => {
      const compounds = data.PC_Compounds
        ? data.PC_Compounds.slice(0, 5).map((c) => c.id.id.cid)
        : [];

      let outputDiv = document.getElementById("drugOutput");
      outputDiv.innerHTML = "<h4>Related Compounds:</h4>";

      if (compounds.length === 0) {
        outputDiv.innerHTML += "<p>No compounds found</p>";
        return;
      }

      compounds.forEach((compound) => {
        outputDiv.innerHTML += `<div class="compound-item">${compound}</div>`;
      });

      const canvas = document.createElement("canvas");
      canvas.id = "drugNetwork";
      canvas.width = outputDiv.offsetWidth;
      canvas.height = 200;
      outputDiv.appendChild(canvas);

      const ctx = canvas.getContext("2d");

      let nodes = [
        { id: query, x: canvas.width / 2, y: canvas.height / 2, fixed: true },
      ];
      nodes.push(
        ...compounds.map((c) => ({
          id: c.toString(),
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          fixed: false,
        }))
      );

      let edges = compounds.map((c) => ({ from: query, to: c.toString() }));

      function simulate() {
        nodes.forEach((a) => {
          if (a.fixed) return;
          let fx = 0,
            fy = 0;

          nodes.forEach((b) => {
            if (a === b) return;
            let dx = a.x - b.x,
              dy = a.y - b.y,
              dist = Math.sqrt(dx * dx + dy * dy),
              rep = 100 / dist;
            fx += (dx / dist) * rep;
            fy += (dy / dist) * rep;
          });

          edges.forEach((e) => {
            if (e.from === a.id || e.to === a.id) {
              let b = nodes.find(
                (n) => n.id === (e.from === a.id ? e.to : e.from)
              );
              let dx = b.x - a.x,
                dy = b.y - a.y;
              fx += dx * 0.01;
              fy += dy * 0.01;
            }
          });

          // Boundary constraints
          if (a.x < 20) fx += 5;
          if (a.x > canvas.width - 20) fx -= 5;
          if (a.y < 20) fy += 5;
          if (a.y > canvas.height - 20) fy -= 5;

          a.x += fx * 0.5;
          a.y += fy * 0.5;
        });

        drawNetwork(ctx, nodes, edges);
        requestAnimationFrame(simulate);
      }

      simulate();

      canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left,
          my = e.clientY - rect.top;

        let hovered = nodes.find(
          (n) => Math.sqrt((n.x - mx) ** 2 + (n.y - my) ** 2) < 15
        );
        drawNetwork(ctx, nodes, edges, hovered);
      });
    })
    .catch((err) => {
      document.getElementById("drugOutput").textContent = "Error: " + err;
    });
}

// Initialize first tab
document.addEventListener("DOMContentLoaded", function () {
  showTab("protein");
});
