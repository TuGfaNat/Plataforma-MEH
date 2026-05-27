import sys
import os

sys.path.insert(0, '.')
from app.models.models import Base

def generate_db_docs():
    output_path = "scratch/db_dict_gen.txt"
    os.makedirs("scratch", exist_ok=True)
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("# GENERATED DATABASE DOCUMENTATION\n\n")
        
        # 1. Generate Mermaid ERD
        f.write("## 1. Diagrama Entidad-Relación Lógico (Mermaid ERD)\n\n")
        f.write("```mermaid\nerDiagram\n")
        
        # Define entities with their PK/FK columns
        for name, table in Base.metadata.tables.items():
            f.write(f"    {name.upper()} {{\n")
            for col in table.columns:
                col_type = str(col.type).replace(" ", "_")
                key_type = ""
                if col.primary_key:
                    key_type = "PK"
                elif col.foreign_keys:
                    key_type = "FK"
                
                f.write(f"        {col_type} {col.name} {key_type}\n")
            f.write("    }\n")
        
        # Define relationships based on foreign keys
        relations = set()
        for name, table in Base.metadata.tables.items():
            for col in table.columns:
                for fk in col.foreign_keys:
                    target_table = fk.column.table.name
                    # Relation target_table ||--o{ table : ""
                    relations.add((target_table.upper(), name.upper()))
        
        for parent, child in sorted(relations):
            f.write(f"    {parent} ||--o{{ {child} : \"fk\"\n")
            
        f.write("```\n\n")
        
        # 2. Generate Data Dictionary for all 29 tables
        f.write("## 2. Diccionario de Datos Relacional Completo\n\n")
        
        for name, table in Base.metadata.tables.items():
            f.write(f"### {name}\n\n")
            f.write("| Nombre del Campo | Tipo de Dato | Clave | Restricciones / Nulidad / Defecto |\n")
            f.write("|---|---|---|---|\n")
            
            for col in table.columns:
                # Field Name
                field_name = f"`{col.name}`"
                
                # Data Type
                data_type = f"`{col.type}`"
                
                # Key
                key = ""
                if col.primary_key:
                    key = "**PK**"
                elif col.foreign_keys:
                    targets = [fk.target_fullname for fk in col.foreign_keys]
                    key = f"**FK** ({', '.join(targets)})"
                
                # Constraints / Nullable / Default
                constraints = []
                if not col.nullable:
                    constraints.append("NOT NULL")
                else:
                    constraints.append("NULL")
                
                if col.unique:
                    constraints.append("UNIQUE")
                
                if col.default is not None:
                    constraints.append(f"DEFAULT: {col.default.arg if hasattr(col.default, 'arg') else col.default}")
                
                if col.server_default is not None:
                    constraints.append(f"SERVER DEFAULT: {col.server_default.arg if hasattr(col.server_default, 'arg') else col.server_default}")
                
                constraints_str = ", ".join(constraints)
                
                f.write(f"| {field_name} | {data_type} | {key} | {constraints_str} |\n")
            f.write("\n")
            
    print(f"Database documentation written to {output_path}")

if __name__ == "__main__":
    generate_db_docs()
