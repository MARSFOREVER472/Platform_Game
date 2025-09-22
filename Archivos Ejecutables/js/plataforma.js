// THE PLAN FOR A SMALL LEVEL MIGHT LOOK LIKE THIS:

let planNivelSimple = `
......................
..#................#..
..#..............=.#..
..#.........o.o....#..
..#.@......#####...#..
..#####............#..
......#++++++++++++#..
......##############..
......................`;

// THE FOLLOWING CLASS STORES A LEVEL OBJECT. IT'S ARGUMENT SHOULD BE THE STRING THAT DEFINES THE LEVEL...

class Nivel 
{
    constructor(plan)
    {
        let filas = plan.trim().split("\n").map(l => [...l]);
        this.altura = filas.length;
        this.anchura = filas[0].length;
        this.comienzoActores = [];

        this.filas = filas.map((fila, y) => 
        {
            return fila.map((ch, x) =>
            {
                let tipo = nivelPersonajes[ch];

                if (typeof tipo != "string")
                {
                    let posicion = new Vec(x, y);
                    this.comienzoActores.push(tipo.create(posicion, ch));
                    tipo = "empty";
                }

                return tipo;
            });
        });
    }
}