"use client";
import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Moon, Sun, Trash2, Plus, Play } from "lucide-react"; // npm install lucide-react

export default function Home() {
  const [ordens, setOrdens] = useState([]);
  const [darkMode, setDarkMode] = useState(true);
  const [form, setForm] = useState({ produto: "", quantidade_planejada: 0, operador: "", meta_hora: 100 });

  const buscarDados = () => {
    fetch("http://127.0.0.1:8000/api/ordens").then(res => res.json()).then(data => setOrdens(data || []));
  };

  useEffect(() => { buscarDados(); }, []);

  const criarOrdem = async (e: any) => {
    e.preventDefault();
    await fetch("http://127.0.0.1:8000/api/ordens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ produto: "", quantidade_planejada: 0, operador: "", meta_hora: 100 });
    buscarDados();
  };

  const registrarProducao = async (id: number) => {
    const qtd = parseInt(prompt("Quantidade produzida no lote:") || "0");
    if (qtd > 0) {
      await fetch(`http://127.0.0.1:8000/api/ordens/${id}/produzir?incremento=${qtd}&status=Produzindo`, { method: "PATCH" });
      buscarDados();
    }
  };

  const excluir = async (id: number) => {
    if (confirm("Deseja encerrar e remover esta OP?")) {
      await fetch(`http://127.0.0.1:8000/api/ordens/${id}`, { method: "DELETE" });
      buscarDados();
    }
  };

  // LÓGICA DE PERFORMANCE
  const totalPlanejado = ordens.reduce((acc, o: any) => acc + o.quantidade_planejada, 0);
  const totalProduzido = ordens.reduce((acc, o: any) => acc + o.quantidade_produzida, 0);
  const oeeGlobal = totalPlanejado > 0 ? ((totalProduzido / totalPlanejado) * 100).toFixed(1) : "0";

  return (
    <div className={`${darkMode ? "bg-[#0F172A] text-slate-100" : "bg-slate-50 text-slate-900"} min-h-screen transition-colors duration-500 font-sans`}>
      <div className="max-w-7xl mx-auto p-6">

        {/* HEADER COM TOGGLE DARK MODE */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-black tracking-tight uppercase">MES <span className="text-indigo-500">Pro</span></h1>
            <p className={`${darkMode ? "text-slate-500" : "text-slate-400"} text-[10px] font-bold tracking-[0.2em]`}>CRUZEIRO INDUSTRIAL HUB</p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-2xl ${darkMode ? "bg-slate-800 text-yellow-400" : "bg-white text-indigo-600 shadow-md"} transition-all`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        {/* DASHBOARD GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatCard title="Disponibilidade (OEE)" value={`${oeeGlobal}%`} color="text-indigo-500" dark={darkMode} />
          <StatCard title="Produção Acumulada" value={totalProduzido} sub={`Meta: ${totalPlanejado}`} dark={darkMode} />
          <StatCard title="Status do Sistema" value="ATIVO" color="text-green-500" dark={darkMode} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LANÇAMENTO TÉCNICO */}
          <section className={`lg:col-span-4 p-8 rounded-[2rem] ${darkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-100 shadow-sm"} border`}>
            <div className="flex items-center gap-2 mb-6">
              <Plus className="text-indigo-500" size={18} />
              <h3 className="text-sm font-black uppercase tracking-widest">Nova Ordem</h3>
            </div>
            <form onSubmit={criarOrdem} className="space-y-4">
              <Input label="Produto / SKU" placeholder="Ex: Chassis-V15" value={form.produto} dark={darkMode}
                onChange={e => setForm({ ...form, produto: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Meta Total" type="number" value={form.quantidade_planejada || ""} dark={darkMode}
                  onChange={e => setForm({ ...form, quantidade_planejada: parseInt(e.target.value) || 0 })} />
                <Input label="Meta p/ Hora" type="number" value={form.meta_hora} dark={darkMode}
                  onChange={e => setForm({ ...form, meta_hora: parseInt(e.target.value) || 0 })} />
              </div>
              <Input label="Operador" placeholder="Nome do Responsável" value={form.operador} dark={darkMode}
                onChange={e => setForm({ ...form, operador: e.target.value })} />
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-indigo-500/20 uppercase text-xs tracking-widest">
                Abrir Ordem de Produção
              </button>
            </form>
          </section>

          {/* GRÁFICO REFINADO */}
          <section className={`lg:col-span-8 p-8 rounded-[2rem] ${darkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-100 shadow-sm"} border`}>
            <h3 className="text-sm font-black uppercase tracking-widest mb-8">Fluxo de Entrega em Tempo Real</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ordens}>
                  <defs> {/* O React entende isso como SVG nativo, sem precisar de import */}
                    <linearGradient id="colorInd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#334155" : "#E2E8F0"} />
                  <XAxis dataKey="produto" fontSize={10} axisLine={false} tickLine={false} stroke={darkMode ? "#64748b" : "#94a3b8"} />
                  <YAxis fontSize={10} axisLine={false} tickLine={false} stroke={darkMode ? "#64748b" : "#94a3b8"} />
                  <Tooltip contentStyle={{ backgroundColor: darkMode ? '#1E293B' : '#FFF', border: 'none', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="quantidade_produzida" stroke="#6366f1" strokeWidth={4} fill="url(#colorInd)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* MONITOR DE EXECUÇÃO */}
          <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ordens.map((o: any) => {
              const perc = ((o.quantidade_produzida / o.quantidade_planejada) * 100).toFixed(0);
              const isLow = Number(perc) < 30;
              return (
                <div key={o.id} className={`p-6 rounded-[2rem] border transition-all ${darkMode ? "bg-slate-800/30 border-slate-700 hover:bg-slate-800/60" : "bg-white border-slate-100 shadow-sm hover:shadow-md"}`}>
                  <div className="flex justify-between items-start mb-6">
                    <span className={`text-[9px] font-black px-3 py-1 rounded-full ${darkMode ? "bg-slate-700 text-slate-400" : "bg-slate-100 text-slate-500"}`}>ID #{o.id}</span>
                    <button onClick={() => excluir(o.id)} className="text-slate-500 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
                  <h4 className="text-xl font-bold mb-1 uppercase tracking-tight">{o.produto}</h4>
                  <p className="text-[10px] font-bold text-indigo-500 mb-6 uppercase tracking-widest">Op: {o.operador}</p>

                  <div className="flex justify-between text-[10px] font-black mb-2 uppercase opacity-60">
                    <span>Progresso Real</span>
                    <span>{perc}%</span>
                  </div>
                  <div className={`w-full h-3 rounded-full mb-6 overflow-hidden ${darkMode ? "bg-slate-700" : "bg-slate-100"}`}>
                    <div className={`h-full transition-all duration-1000 ${isLow ? "bg-orange-500" : "bg-indigo-500"}`} style={{ width: `${perc}%` }}></div>
                  </div>

                  <button
                    onClick={() => registrarProducao(o.id)}
                    className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${darkMode ? "bg-slate-700 hover:bg-indigo-600" : "bg-slate-50 hover:bg-indigo-600 hover:text-white"}`}
                  >
                    <Play size={12} fill="currentColor" /> Apontar Lote
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// COMPONENTES AUXILIARES PARA LIMPEZA DO CÓDIGO
function StatCard({ title, value, sub, color = "text-inherit", dark }: any) {
  return (
    <div className={`p-8 rounded-[2rem] border ${dark ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-100 shadow-sm"}`}>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{title}</p>
      <h2 className={`text-4xl font-black ${color}`}>{value}</h2>
      {sub && <p className="text-[10px] text-slate-400 mt-2 font-bold italic uppercase">{sub}</p>}
    </div>
  );
}

function Input({ label, dark, ...props }: any) {
  return (
    <div>
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block ml-2">
        {label}
      </label>
      <input
        {...props}
        className={`w-full p-4 rounded-2xl border-none outline-none focus:ring-2 ring-indigo-500 transition-all text-sm 
          ${dark ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-900"}`}
      />
    </div>
  );
}