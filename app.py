def generar_salas_svg(nivel, semilla, ancho=1200, alto=800):
    random.seed(semilla + nivel)

    num_salas = random.randint(8, 14)
    salas = []

    tipos_posibles = ["vacía", "enemigos", "cofre", "trampa", "bloqueada", "especial"]

    # Entrada
    salas.append({
        "x": random.randint(50, ancho - 150),
        "y": random.randint(50, alto - 150),
        "w": random.randint(70, 120),
        "h": random.randint(70, 120),
        "tipo": "entrada"
    })

    # Intermedias
    for _ in range(num_salas - 2):
        tipo = random.choice(tipos_posibles)
        salas.append({
            "x": random.randint(50, ancho - 150),
            "y": random.randint(50, alto - 150),
            "w": random.randint(60, 110),
            "h": random.randint(60, 110),
            "tipo": tipo
        })

    # Jefe (cada 10 niveles) o especial (cada 5)
    if nivel % 10 == 0:
        tipo_final = "jefe"
    elif nivel % 5 == 0:
        tipo_final = "especial"
    else:
        tipo_final = random.choice(tipos_posibles)

    salas.append({
        "x": random.randint(50, ancho - 150),
        "y": random.randint(50, alto - 150),
        "w": random.randint(80, 130),
        "h": random.randint(80, 130),
        "tipo": tipo_final
    })

    # Conexiones entre centros
    conexiones = []
    for i in range(len(salas) - 1):
        c1x = salas[i]["x"] + salas[i]["w"] // 2
        c1y = salas[i]["y"] + salas[i]["h"] // 2
        c2x = salas[i + 1]["x"] + salas[i + 1]["w"] // 2
        c2y = salas[i + 1]["y"] + salas[i + 1]["h"] // 2
        conexiones.append((c1x, c1y, c2x, c2y))

    # Colores por tipo
    colores = {
        "entrada": "#0f0",
        "jefe": "#f00",
        "especial": "#f0f",
        "enemigos": "#800",
        "cofre": "#ff0",
        "trampa": "#f80",
        "vacía": "#444",
        "bloqueada": "#00f"
    }

    iconos = {
        "entrada": "🚪",
        "jefe": "💀",
        "especial": "💠",
        "enemigos": "🧟",
        "cofre": "🧳",
        "trampa": "💣",
        "vacía": "",
        "bloqueada": "🔒"
    }

    # SVG
    svg = f'<svg width="{ancho}" height="{alto}" xmlns="http://www.w3.org/2000/svg" style="background-color:#111;">'

    # Conexiones
    for x1, y1, x2, y2 in conexiones:
        svg += f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#0ff" stroke-width="2"/>'

    # Salas
    for sala in salas:
        x, y, w, h, tipo = sala["x"], sala["y"], sala["w"], sala["h"], sala["tipo"]
        color = colores.get(tipo, "#444")
        icono = iconos.get(tipo, "")
        svg += f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{color}" stroke="#fff" stroke-width="2"/>'
        if icono:
            svg += f'<text x="{x + w//2}" y="{y + h//2}" text-anchor="middle" fill="#fff" font-size="24" dominant-baseline="middle">{icono}</text>'

    svg += '</svg>'
    return svg