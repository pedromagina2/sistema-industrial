from fastapi import FastAPI
from pydantic import BaseModel
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configuração de CORS para permitir que o Frontend fale com o Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONFIGURAÇÃO SUPABASE ---
URL_SUPABASE = "https://mqjyfmckwnodqnokexyq.supabase.co"
CHAVE_SUPABASE = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xanlmbWNrd25vZHFub2tleHlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNDc4MTAsImV4cCI6MjA5MzgyMzgxMH0.MY5PU4HmwFCnWKGAuaPgAdNftOSlBqghNzrDI3d7N34"

supabase: Client = create_client(URL_SUPABASE, CHAVE_SUPABASE)

# Modelo de dados para a Ordem de Produção
class Ordem(BaseModel):
    produto: str
    quantidade_planejada: int
    operador: str

@app.get("/api/ordens")
def listar_ordens():
    # Busca todas as ordens no banco
    resposta = supabase.table("ordens_producao").select("*").order("id").execute()
    return resposta.data

@app.post("/api/ordens")
def criar_ordem(o: Ordem):
    # Insere uma nova ordem
    dados = o.dict()
    return supabase.table("ordens_producao").insert(dados).execute()

@app.patch("/api/ordens/{id}/produzir")
def atualizar_producao(id: int, incremento: int, status: str):
    # Busca a quantidade que já foi produzida antes
    item = supabase.table("ordens_producao").select("quantidade_produzida").eq("id", id).single().execute()
    nova_qtd = item.data['quantidade_produzida'] + incremento
    
    # Atualiza o banco com a nova soma e o novo status
    return supabase.table("ordens_producao").update({
        "quantidade_produzida": nova_qtd,
        "status": status
    }).eq("id", id).execute()

@app.delete("/api/ordens/{id}")
def excluir_ordem(id: int):
    return supabase.table("ordens_producao").delete().eq("id", id).execute()

# No main.py, atualize o modelo Pydantic
class Ordem(BaseModel):
    produto: str
    quantidade_planejada: int
    operador: str
    meta_hora: int = 100  # Adicionamos uma meta de velocidade