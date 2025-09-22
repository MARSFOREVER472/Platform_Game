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

// WE'LL USE A "State" CLASS TO TRACK THE STATE OF A RUNNING GAME...

class Estado
{
    constructor(nivel, actores, estado)
    {
        this.nivel = nivel;
        this.actores = actores;
        this.estado = estado;
    }

    static comenzar(nivel)
    {
        return new Estado(nivel, nivel.comienzoActores, "playing");
    }

    get jugador()
    {
        return this.actores.find(a => a.tipo == "player");
    }
}

// THIS IS A "Vec" CLASS THAT WE'LL USE FOR OUR TWO-DIMENSIONAL VALUES, SUCH AS THE POSITION AND SIZE OF ACTORS...

class Vec
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
    }

    plus(other)
    {
        return new Vec(this.x + other.x, this.y + other.y);
    }

    times(factor)
    {
        return new Vec(this.x * factor, this.y * factor);
    }
}

// THE "Player" CLASS HAS A "speed" PROPERTY THAT STORES IT'S CURRENT SPEED TO SIMULATE MOMENTUM AND GRAVITY...

class Jugador 
{
    constructor(posicion, velocidad)
    {
        this.posicion = posicion;
        this.velocidad = velocidad;
    }

    get tipo() 
    {
        return "player";
    }

    static create(posicion)
    {
        return new Jugador(posicion.plus(new Vec(0, -0.5)),
                           new Vec(0, 0));
    }
}

Jugador.prototype.size = new Vec(0.8, 1.5);

// THE "create" METHOD LOOKS AT THE CHARACTER THAT THE LEVEL CONSTRUCTOR PASSES AND CREATES THE APPROPIATE "Lava" ACTOR...

class Lava
{
    constructor(posicion, velocidad, reinicio)
    {
        this.posicion = posicion;
        this.velocidad = velocidad;
        this.reinicio = reinicio;
    }

    get tipo() 
    {
        return "lava";
    }

    static create(posicion, ch)
    {
        if (ch == "=")
        {
            return new Lava(posicion, new Vec(2, 0));
        }

        else 

        if (ch == "|")
        {
            return new Lava(posicion, new Vec(0, 2));
        }

        else

        if (ch == "v")
        {
            return new Lava(posicion, new Vec(0, 3));
        }
    }
}

Lava.prototype.size = new Vec(1, 1);