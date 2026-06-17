import os

files_to_update = [
    r"C:\Users\N A T\.gemini\antigravity\brain\f64d29cc-2960-4b4d-ae06-b5c86846dccf\acta_entrega_meh.md",
    r"f:\Plataforma-MEH\tesis\02_borrador_refinado.md",
    r"f:\Plataforma-MEH\website\docs\tecnico\01-arquitectura-contexto.md",
    r"f:\Plataforma-MEH\website\docs\tecnico\02-detalle-frontend.md",
    r"f:\Plataforma-MEH\website\docs\tecnico\03-mapeo-paginas-jsx.md",
    r"f:\Plataforma-MEH\website\docs\tecnico\04-detalle-backend.md",
    r"f:\Plataforma-MEH\website\docs\tecnico\05-base-datos-seguridad.md",
]

for file_path in files_to_update:
    if os.path.exists(file_path):
        print(f"Actualizando {file_path}...")
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Reemplazar Microsoft Learn Student Ambassadors
        content = content.replace("Microsoft Learn Student Ambassadors", "Microsoft Student Ambassadors")
        content = content.replace("Microsoft Learn Student Ambassador", "Microsoft Student Ambassador")
        content = content.replace("Ambassadors (MLSA)", "Ambassadors (MSA)")
        content = content.replace("Ambassador /", "Ambassador /")
        
        # Reemplazar MLSA y mlsa
        content = content.replace("MLSA", "MSA")
        # Reemplazar dominios / subdominios si aplica
        content = content.replace("mlsa-bolivia.org", "msa-bolivia.org")
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Completado: {file_path}")
    else:
        print(f"No existe: {file_path}")
