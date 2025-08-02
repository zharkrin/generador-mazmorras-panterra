from .utils import generar_bioma, generar_jefe, generar_campamento

def generar_niveles_mazmorra(niveles_totales):
    niveles = []

    for i in range(1, niveles_totales + 1):
        nivel = {
            "numero": i,
            "bioma": generar_bioma(i),
            "elementos": []
        }

        # Si es múltiplo de 10 → añadir jefe
        if i % 10 == 0:
            nivel["elementos"].append(generar_jefe(i))

            # Luego del jefe → añadir campamento en nivel intermedio .5
            campamento = generar_campamento(i)
            niveles.append(nivel)  # primero el nivel del jefe
            niveles.append({
                "numero": campamento["nivel"],
                "bioma": "zona_segura",
                "elementos": [campamento]
            })
        else:
            niveles.append(nivel)

    return niveles