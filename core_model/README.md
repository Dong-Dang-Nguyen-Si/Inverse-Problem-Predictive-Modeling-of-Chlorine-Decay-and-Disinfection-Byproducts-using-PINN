\# 💧 AquaPINN: Physics-Informed Neural Network for Real-Time Water Quality Simulation



\[!\[Python 3.10+](https://img.shields.io/badge/python-3.10+-blue.svg)](https://www.python.org/)

\[!\[PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?logo=pytorch\&logoColor=white)](https://pytorch.org/)

\[!\[React](https://img.shields.io/badge/React-20232A?logo=react\&logoColor=61DAFB)](https://reactjs.org/)

\[!\[Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite\&logoColor=white)](https://vitejs.dev/)

\[!\[License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)



> \*\*A real-time Physics-Informed Deep Learning framework modeling chlorine decay and carcinogenic Trihalomethane (THM) kinetics in municipal drinking water distribution networks\[cite: 1, 2].\*\*



\---



\## 📌 Overview \& Real-World Problem

Municipal water treatment utilities face a critical operational trade-off:

\- \*\*Under-dosing Chlorine:\*\* Residual chlorine drops below safe thresholds ($< 0.2\\text{ mg/L}$), triggering bacterial regrowth and waterborne pathogens\[cite: 1, 2].

\- \*\*Over-dosing Chlorine:\*\* Excess free chlorine reacts with Natural Organic Matter (TOC), forming dangerous disinfection byproducts like \*\*Trihalomethanes (THMs)\*\*—regulated carcinogens strictly capped at $100\\ \\mu\\text{g/L}$\[cite: 1, 2].



Traditional numerical solvers (CFD, finite difference) are slow and struggle with sparse real-world sensor data. \*\*AquaPINN\*\* resolves this by fusing governing differential kinetics directly into the loss function of deep neural networks, enabling zero-latency forecasting and parameter identification\[cite: 1, 2].



\---



\## 🔬 Mathematical Formulation (PINN Core)



The continuous-time biochemical kinetics are governed by coupled ordinary differential equations (ODEs) over $t \\in \[0, 72\\text{ hours}]$:



\### 1. Free Chlorine Decay ODE

$$\\frac{dC\_{Cl}}{dt} = -\\left(k\_b + \\frac{S}{V} k\_w\\right) C\_{Cl}$$



\* $k\_b = 0.02\\text{ h}^{-1}$: bulk water decay constant\[cite: 1].

\* $S/V = 1.0 / 12.5\\text{ m}^{-1}$: surface-area-to-volume ratio of the storage tank/pipe\[cite: 1].

\* $k\_w$: learnable wall reaction rate parameter (inverse problem)\[cite: 1].



\### 2. Disinfection Byproduct (THM) Formation ODE

$$\\frac{dC\_{THM}}{dt} = \\frac{k\_f \\cdot \[\\text{TOC}] \\cdot C\_{Cl}}{100.0}$$

\[cite: 1]

\* $\[\\text{TOC}]$: seasonal Total Organic Carbon concentration (mg/L)\[cite: 1].

\* $k\_f$: learnable THM yield coefficient\[cite: 1].



\---



\## 🧠 PINN Architecture \& Key Innovations



\* \*\*Automatic Differentiation (`autograd`):\*\* Exact analytical derivatives $\\frac{dC\_{Cl}}{dt}$ and $\\frac{dC\_{THM}}{dt}$ computed directly from the computational graph without discretization errors\[cite: 1].

\* \*\*Thermodynamic Validity Constraints:\*\* Reaction kinetic rates $k\_w$ and $k\_f$ are wrapped with `nn.functional.softplus` to enforce strictly positive physical bounds ($k > 0$)\[cite: 1].

\* \*\*Adaptive Multi-Task Loss Weighting:\*\* Incorporates homoscedastic uncertainty learning parameters ($s$) to balance boundary MSE losses ($\\mathcal{L}\_{BC}$) with physics equation residuals ($\\mathcal{L}\_{PDE}$)\[cite: 1]:

&#x20; $$\\mathcal{L}\_{total} = \\sum\_{i=1}^{4} \\left( e^{-s\_i} \\mathcal{L}\_i + s\_i \\right)$$

\[cite: 1]

\* \*\*Collocation Sampling:\*\* Employs Latin Hypercube Sampling (LHS) via `scipy.stats.qmc` to optimize physics collocation point distribution across the continuous time domain\[cite: 1].



\---



\## 📂 Project Structure



```text

├── core\_model/

│   └── Hackathon\_PINN.ipynb     # PyTorch PINN model \& training loop\[cite: 1]

├── src/                         # Interactive React + TypeScript Simulator\[cite: 3]

│   ├── utils/

│   │   └── pinnMath.ts          # Client-side numerical kinetics engine

│   ├── App.tsx                  # Main simulator dashboard\[cite: 3]

│   └── main.tsx

├── package.json                 # Web dependencies\[cite: 3]

├── vite.config.ts               # Vite build configuration\[cite: 3]

└── README.md

