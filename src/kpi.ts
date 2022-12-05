export function meanOfTransport(answer: string) {
    switch (answer) {
    case "Auto solo/a": return 0.000192;
    case "Auto con 1 acompañante": return 0.000092;
    case "Auto con 2 acompañantes": return 0.000064;
    case "Auto con 3 o más acompañantes": return 0.000048;
    case "Transporte Público": return 0.000013;
    case "Bicicleta": return 0.0;
    case "Pie": return 0.0;
    default: return 0.0;
    }
}

export function distance(answer: string) {
    switch (answer) {
    case "Cerrillos": return 11.7;
    case "Cerro Navia": return 20.1;
    case "Conchalí": return 16.8;
    case "El Bosque": return 12.3;
    case "Estación Central": return 14.2;
    case "Huechuraba": return 16.7;
    case "Independencia": return 13.2;
    case "La Cisterna": return 7.4;
    case "La Florida": return 7.6;
    case "La Granja": return 5.9;
    case "La Pintana": return 12.9;
    case "La Reina": return 14.1;
    case "Las Condes": return 18.6;
    case "Lo Barnechea": return 25.3;
    case "Lo Espejo": return 10;
    case "Lo Prado": return 16.4;
    case "Macul": return 3.1;
    case "Maipú": return 16.9;
    case "Ñuñoa": return 6.7;
    case "Pedro Aguirre Cerda": return 6.6;
    case "Providencia": return 9.4;
    case "Pudahuel": return 18.5;
    case "Puente Alto": return 12.8;
    case "Quilicura": return 23;
    case "Quinta Normal": return 15.1;
    case "Recoleta": return 12.9;
    case "Renca": return 17.8;
    case "San Bernardo": return 17.3;
    case "San Joaquín": return 1.7;
    case "San Miguel": return 3.7;
    case "San Ramón": return 7.3;
    case "Santiago": return 11.5;
    case "Vitacura": return 18.3;
    default: return 0;
    }
}
