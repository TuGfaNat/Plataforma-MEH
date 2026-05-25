def jaro_winkler_similarity(s1: str, s2: str) -> float:
    """Calcula la similitud de Jaro-Winkler entre dos cadenas (0.0 a 100.0)."""
    s1 = s1.strip().lower()
    s2 = s2.strip().lower()
    
    if s1 == s2:
        return 100.0
        
    len1 = len(s1)
    len2 = len(s2)
    
    if len1 == 0 or len2 == 0:
        return 0.0
        
    match_bound = max(len1, len2) // 2 - 1
    if match_bound < 0:
        match_bound = 0
        
    s1_matches = [False] * len1
    s2_matches = [False] * len2
    
    matches = 0
    transpositions = 0
    
    # 1. Encontrar caracteres coincidentes
    for i in range(len1):
        start = max(0, i - match_bound)
        end = min(len2, i + match_bound + 1)
        
        for j in range(start, end):
            if not s2_matches[j] and s1[i] == s2[j]:
                s1_matches[i] = True
                s2_matches[j] = True
                matches += 1
                break
                
    if matches == 0:
        return 0.0
        
    # 2. Contar transposiciones
    k = 0
    for i in range(len1):
        if s1_matches[i]:
            while not s2_matches[k]:
                k += 1
            if s1[i] != s2[k]:
                transpositions += 1
            k += 1
            
    t = transpositions // 2
    
    # Similitud de Jaro
    jaro = (matches / len1 + matches / len2 + (matches - t) / matches) / 3.0
    
    # Modificación Winkler (Prefijo común de hasta 4 caracteres)
    p = 0.1
    l = 0
    for i in range(min(4, len1, len2)):
        if s1[i] == s2[i]:
            l += 1
        else:
            break
            
    jaro_winkler = jaro + l * p * (1.0 - jaro)
    return jaro_winkler * 100.0

def check_name_in_description_fuzzy(full_name: str, description: str) -> float:
    """Busca de forma difusa las palabras del nombre en la descripción bancaria.
    
    Retorna el porcentaje de palabras coincidentes con un umbral Jaro-Winkler de 85%.
    """
    # Normalizar eliminando caracteres especiales comunes
    def normalize(text):
        accents = {'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u', 'ñ': 'n', 'ü': 'u'}
        normalized = text.lower()
        for char, repl in accents.items():
            normalized = normalized.replace(char, repl)
        # Limpieza simple de puntuación
        for punc in '.,-_/\\()[]{}':
            normalized = normalized.replace(punc, ' ')
        return normalized

    norm_name = normalize(full_name)
    norm_desc = normalize(description)
    
    name_words = [w for w in norm_name.split() if len(w) > 2] # Ignorar preposiciones de 2 letras o menos
    desc_words = [w for w in norm_desc.split() if len(w) > 2]
    
    if not name_words:
        return 0.0
        
    matches = 0
    for nw in name_words:
        word_matched = False
        for dw in desc_words:
            similarity = jaro_winkler_similarity(nw, dw)
            if similarity >= 85.0: # Umbral de coincidencia del 85% para typos
                word_matched = True
                break
        if word_matched:
            matches += 1
            
    return (matches / len(name_words)) * 100.0
