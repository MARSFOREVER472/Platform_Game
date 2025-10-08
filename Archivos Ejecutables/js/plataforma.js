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
                let type = nivelPersonajes[ch];

                if (typeof type != "string")
                {
                    let posicion = new Vec(x, y);
                    this.comienzoActores.push(type.create(posicion, ch));
                    type = "empty";
                }

                return type;
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
        return this.actores.find(a => a.type == "player");
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

    get type() 
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

// COIN ACTORS ARE RELATIVELY SIMPLE. THEY MOSTLY JUST SIT IN THEIR PLACE. BUT TO LIVEN UP THE GAME A LITTLE, THEY ARE GIVEN A "wooble", A SLIGHT VERTICAL "BACK-AND-FORTH" MOTION. TO TRACK THIS, A COIN OBJECT STORES A BASE POSITION AS WELL AS A "wobble" PROPERTY THAT TRACKS THE PHASE OF THE BOUNCING MOTION. TOGETHER, THESE DETERMINE THE COIN'S ACTUAL POSITION...

class Monedas
{
    constructor(posicion, posicionBase, tambaleo)
    {
        this.posicion = posicion;
        this.posicionBase = posicionBase;
        this.tambaleo = tambaleo;
    }

    get tipo()
    {
        return "coin";
    }

    static create(posicion)
    {
        let posicionBase = posicion.plus(new Vec(0.2, 0.1));
        return new Monedas(posicionBase, posicionBase, Math.random() * Math.PI * 2);
    }

}

Monedas.prototype.size = new Vec(0.6, 0.6);

// WE CAN NOW DEFINE THE "levelChars" OBJECT THAT MAPS PLAN CHARACTERS TO EITHER BACKGROUND GRID TYPES OR ACTOR CLASSES...

const nivelPersonajes = {
  ".": "empty", "#": "wall", "+": "lava",
  "@": Jugador, "o": Monedas,
  "=": Lava, "|": Lava, "v": Lava
};

// THAT GIVES US ALL THE PARTS NEEDED TO CREATE A LEVEL INSTANCE...
// WE ARE NOW ABLE TO DISPLAY OUR TINY LEVEL...

let nivelSimple = new Nivel(planNivelSimple);
let display = new DOMdisplay(document.body, nivelSimple);
display.syncState(Estado.comenzar(nivelSimple));

console.log(`${nivelSimple.anchura} by ${nivelSimple.altura}`);

// 22 by 9...

// THE TASK AHEAD IS TO DISPLAY SUCH LEVELS ON THE SCREEN AND TO MODEL TIME AND MOTION INSIDE THEM.

// THE FOLLOWING HELPER FUNCTION PROVIDES A SUCCINCT WAY TO CREATE AN ELEMENT AND GIVE IT SOME ATTRIBUTES AND CHILD NODES...

function elemento(nombre, atributos, hijos)
{
    let dom = document.createElement(nombre);

    for(let atributo of Object.keys(atributos))
    {
        dom.setAttribute(atributo, atributos[atributo]);
    }

    for(let hijo of hijos)
    {
        dom.appendChild(hijo);
    }

    return dom;
}

// A DISPLAY IS CREATED BY GIVING IT A PARENT ELEMENT TO WHICH IT SHOULD APPEND ITSELF AND A LEVEL OBJECT...

class DOMdisplay
{
    constructor(pariente, nivel)
    {
        this.dom = elemento("div", {class: "game"}, dibujarCasilla(nivel));
        this.actorLayer = null;
        pariente.appendChild(this.dom);
    }

    clear()
    {
        this.dom.Remove();
    }

}

// OUR COORDINATES AND SIZES ARE TRACKED IN GRID UNITS, WHERE A SIZE OF DISTANCE OF 1 MEANS ONE GRID BLOCK. WHEN SETTING PIXEL SIZES, WE WILL HAVE TO SCALE THESE COORDINATES UP - EVERYTHING IN THE GAME WOULD BE RIDICULOUSLY SMALL AT A SINGLE PIXEL PER SQUARE. THE SCALE CONSTANT GIVES A NUMBER OF PIXELS THAT A SINGLE UNIT TAKES UP ON THE SCREEN...

const escala = 20;

function dibujarCasilla(nivel)
{
    return elemento("table", {
        class: "background",
        style: `width: ${nivel.width * escala}px`
    }, ...nivel.filas.map(fila =>
        elemento("tr", {style: `height: ${escala}px`},
            ...fila.map(type => elemento("td", {class: type}))
        ))
    );
}

function dibujarActores(actores)
{
    return elemento("div", {}, ...actores.map(actor => {
        let rect = elemento("div", {class: `actor ${actor.type}`});
        rect.style.width = `${actor.size.x * escala}px`;
        rect.style.height = `${actor.size.y * escala}px`;
        rect.style.left = `${actor.posicion.x * escala}px`;
        rect.style.top = `${actor.posicion.y * escala}px`;
        return rect;
    }));
}

// THE "syncState" METHOD IS USED TO MAKE THE DISPLAY SHOW A GIVEN STATE. IT FIRST REMOVES THE OLD ACTOR GRAPHICS, IF ANY, AND THEN REDRAWS THE ACTORS IN THEIR NEW POSITIONS. It may be tempting to try to reuse the DOM elements for actors, but to make that work, we would need a lot of additional bookkeeping to associate actors with DOM elements and to make sure we remove elements when their actors vanish. Since there will typically be only a handful of actors in the game, redrawing all of them is not expensive.

DOMdisplay.prototype.syncState = function(estadoActual)
{
    if(this.actorLayer) this.actorLayer.remove();
    this.actorLayer = dibujarActores(estadoActual.actores);
    this.dom.className = `game ${estadoActual.estado}`;
    this.scrollPlayerIntoView(estadoActual);
}

// IN THE "scrollPlayerIntoView" METHOD, WE FIND THE PLAYER'S POSITION AND UPDATE THE WRAPPING ELEMENT'S SCROLL POSITION. WE CHANGE THE SCROLL POSITION BY MANIPULATING THAT ELEMENT'S "scrollLeft" AND "scrollTop" PROPERTIES WHEN THE PLAYER IS TOO CLOSE TO THE EDGE.

DOMdisplay.proptotype.scrollPlayerIntoView = function(estadoActual)
{
    let anchura = this.dom.clientWidth;
    let altura = this.dom.clientHeight;
    let margin = anchura / 3;

    // THE VIEWPORT:

    let left = this.dom.scrollLeft, right = left + anchura;
    let top = this.dom.scrollTop, bottom = top + altura;

    let jugador = estadoActual.jugador;
    let centrado = jugador.posicion.plus(jugador.size.times(0.5)).times(escala);

    // POSICIÓN HORIZONTAL DEL JUEGO...

    if (centrado.x < left + margin)
    {
        this.dom.scrollLeft = centrado.x - margin;
    }

    else

    if (centrado.x > right - margin)
    {
        this.dom.scrollLeft = centrado.x + margin - anchura;
    }

    // POSICIÓN VERTICAL DEL JUEGO...

        if (centrado.y < top + margin)
    {
        this.dom.scrollTop = centrado.y - margin;
    }

    else

    if (centrado.y > bottom - margin)
    {
        this.dom.scrollTop = centrado.y + margin - altura;
    }
}

// THIS METHOD TELLS US WHETHER A RECTANGLE (SPECIFIED BY A POSITION AND A SIZE) TOUCHES A GRID ELEMENT OF THE GIVEN TYPE.

Nivel.prototype.touches = function(posicion, size, type)
{
    let comienzoX = Math.floor(posicion.x);
    let finalX = Math.ceil(posicion.x + size.x);

    let comienzoY = Math.floor(posicion.y);
    let finalY = Math.ceil(posicion.y + size.y);

    for (let y = comienzoY; y < finalY; y++)
    {
        for (let x = comienzoX; x < finalX; x++)
        {
            let afuera = x < 0 || x > this.anchura || y < 0 || y > this.altura;
            let aqui = afuera ? "wall" : this.filas[y][x];
            if (here == type)
            return true;
        }
    }

    return false;
};

// THE STATE "update" METHOD USES TOUCHES TO FIGURE OUT WHETHER THE PLAYER IS TOUCHING LAVA...

Estado.prototype.update = function(time, keys)
{
    let actores = this.actores.map(actor => actor.update(time, this.keys));
    let nuevoEstado = new Estado(this.nivel, actores, this.estado);

    if (nuevoEstado.estadoActual != "playing")
        return nuevoEstado;

    let jugador = nuevoEstado.jugador;

    if (this.nivel.touches(jugador.posicion, jugador.size, "lava"))
    {
        return new Estado(this.nivel, actores, "lost");
    }

    for (let actor of actores)
    {
        if (actor != jugador && overlap(actor, jugador))
        {
            nuevoEstado = actor.collide(nuevoEstado);
        }
    }

    return nuevoEstado;
}

// FUNCIÓN PARA TRASLAPAR ENTRE 2 PERSONAJES PRINCIPALES DEL JUEGO...

function overlap(actor1, actor2)
{
    return actor1.posicion.x + actor1.size.x > actor2.posicion.x && 
           actor1.posicion.x < actor2.posicion.x + actor2.size.x &&
           actor1.posicion.y + actor1.size.y + actor2.posicion.y &&
           actor1.posicion.y < actor2.posicion.y + actor2.size.y;
}

// If any actor does overlap, its collide method gets a chance to update the state. Touching a lava actor sets the game status to "lost". Coins vanish when you touch them and set the status to "won" when they are the last coin of the level.

Lava.prototype.collide = function(estado)
{
    return new Estado(estado.nivel, estado.actores, "lost");
};

Monedas.prototype.collide = function(estado)
{
    let filtrado = estado.actores.filter(a => a != this);
    let estadoActual = estado.estadoActual;

    if (!filtrado.some(a => a.type == "coin")) estadoActual = "won";

    return new Estado(estadoActual.nivel, filtrado, estadoActual);
};

