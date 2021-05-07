var Class = require('../../utils/Class');
var Vector2 = require('../../math/Vector2');

/**
 * Holds "sided" information: left, top/up, right, bottom/down, and 'none'. This is compatible with Arcade.Body (which has additional support for calling its 'top' side `up` for compatibility) as well as body's `touching`, `blocked`, etc fields (which call the side `up`. However, see subtype ~Blocked below for discussion.
 *
 * @typedef {Object} Phaser.Physics.Arcade.BaseAxis~Sided
 * @template Side - The type of information stored on each side (usually number or boolean)
 * @property {Side} up - The top side of this figure.
 * @property {Side} right - The right side of this figure.
 * @property {Side} down - The bottom side of this figure.
 * @property {Side} left - The left side of this figure.
 */
/**
 * As ~Sided<boolean>, but additionally supports `x.none = !(x.up || x.right || x.down || x.left)`).
 *
 * @typedef {Phaser.Physics.Arcade.BaseAxis~Sided<bool>} Phaser.Physics.Arcade.BaseAxis~Edges
 * @property {boolean} none - True iff up/right/down/left are false.
 */

/**
 * @classdesc
 * A prototype for axes (like X and Y).
 *
 * Axes are defined entirely by their methods, for instance in the X axis being able to derive vectors' X components, object's widths (but not heights), left and right sides, and so on. As a result, it doesn't make sense to instantiate an axis object; though this is documented as though it were a class, it is not! Use Axis.X and Axis.Y to get access to axes.
 *
 * @class BaseAxis
 * @memberof Phaser.Physics.Arcade
 * @ignore
 * @since 3.54.0
 */
var BaseAxis = new Class({
    initialize: function(name, basis)
    {
        /**
         * Stores the name of this axis (for debugging).
         *
         * @name Phaser.Physics.Arcade.BaseAxis#name
         * @type {string}
         * @since 3.54.0
         */
        this.name = name;
        /**
         * The unit vector in this axis direction.
         *
         * @name Phaser.Physics.Arcade.BaseAxis#basis
         * @type {Phaser.Math.Vector2}
         * @since 3.54.0
         */
        this.basis = basis;
        /**
         * The other axis (so Y for X, or X for Y).
         *
         * @abstract
         * @name Phaser.Physics.Arcade.BaseAxis#other
         * @type {Phaser.Physics.Arcade.BaseAxis}
         * @since 3.54.0
         */
        this.other = undefined;
    },

    /**
     * Gets the vectorlike value in the direction of this axis.
     *
     * @abstract
     * @method Phaser.Physics.Arcade.BaseAxis#get
     * @since 3.54.0
     *
     * @param {Phaser.Math.Vector2Like} v - An object with `x` or `y` properties like a vector.
     * @returns number - The vectorlike projection into `this` axis.
     */
    get: function(v)
    {
        throw new Error('Unimplemented');
    },
    /**
     * Sets the vectorlike value in the direction of this axis.
     *
     * @abstract
     * @method Phaser.Physics.Arcade.BaseAxis#set
     * @since 3.54.0
     *
     * @param {Phaser.Math.Vector2Like} v - An object with `x` or `y` properties like a vector.
     * @param {number} val - The value to set into x or y (as appropriate for this axis).
     * @returns number - `val` (for chaining).
     */
    set: function(v, val)
    {
        throw new Error('Unimplemented');
    },
    /**
     * Gets the `left` or `up` property as appropriate for axis.
     *
     * @abstract
     * @method Phaser.Physics.Arcade.BaseAxis#lu
     * @since 3.54.0
     *
     * @param {Phaser.Physics.Arcade.BaseAxis~Sided<T>} v - An object with a left or up edge
     * @returns {T} - The value of v.left (for `this==Axis.X`; v.up for `this==Axis.Y`).
     * @template T
     */
    lu: function(v)
    {
        throw new Error('Unimplemented');
    },
    /**
     * Gets the `right` or `down` property as appropriate for axis.
     *
     * @abstract
     * @method Phaser.Physics.Arcade.BaseAxis#rd
     * @since 3.54.0
     *
     * @param {Phaser.Physics.Arcade.BaseAxis~Sided<T>} v - An object with a right or down edge
     * @returns {T} - The value of v.right (for `this==Axis.X`; v.down for `this==Axis.Y`).
     * @template T
     */
    rd: function(v)
    {
        throw new Error('Unimplemented');
    },
    /**
     * Sets true for the left & right (or up and down) edges as appropriate for this axis. False arguments are *ignored*, since once a side is touching/blocked/etc, some other mechanism is assumed to clear it.
     *
     * @abstract
     * @method Phaser.Physics.Arcade.BaseAxis#setEdges
     * @param {Phaser.Physics.Arcade.BaseAxis~Edges} v - The blocking-type body to set opposite touch information on. The `none` invariant will be observed.
     * @param {boolean} lu - The value for the left or top side.
     * @param {boolean} rd - The value for the right or bottom side.
     */
    setEdges: function(v, lu, rd)
    {
        throw new Error('Unimplemented');
    },
    /**
     * Gets the `customSeparateFoo` (for Foo `X` or `Y` as appropriate) from the given object.
     *
     * @abstract
     * @method Phaser.Physics.Arcade.BaseAxis#getCustomSeparate
     * @since 3.54.0
     *
     * @param {(Phaser.Physics.Arcade.Body|Phaser.Physics.Arcade.StaticBody)} v - The object to pull customSeparateFoo fields from.
     * @returns boolean - Whether the body is custom-separate along this axis.
     */
    getCustomSeparate: function(v)
    {
        throw new Error('Unimplemented');
    },

    /**
     * Adds a scalar value to the x (or y) value of a vector.
     *
     * @method Phaser.Physics.Arcade.BaseAxis#inc
     * @since 3.54.0
     *
     * @param {Phaser.Math.Vector2Like} v - An object with `x` or `y` properties like a vector.
     * @param {number} val - The value to increase v's projection into this axis by.
     * @returns number - `v.(x|y)+val` (for chaining).
     */
    inc: function(v, val)
    {
        return this.set(v, this.get(v) + val);
    },
    /**
     * Gets v1-v2 within this axis.
     *
     * @method Phaser.Physics.Arcade.BaseAxis#delta
     * @since 3.54.0
     *
     * @param {Phaser.Math.Vector2Like} v1 - The base vector
     * @param {Phaser.Math.Vector2Like} v2 - The vector to subtract
     * @returns number - `v1.(x|y)-v2.(x|y)`.
     */
    delta: function(v1, v2)
    {
        return this.get(v1) - this.get(v2);
    },

    /**
     * Determines whether `a` is 'left of' (or on top of) `b` along this axis.
     *
     * @method Phaser.Physics.Arcade.BaseAxis#inOrder
     * @since 3.54.0
     *
     * @param {Phaser.Physics.Arcade.Body|Phaser.Physics.Arcade.StaticBody} a - The first body to check.
     * @param {Phaser.Physics.Arcade.Body|Phaser.Physics.Arcade.StaticBody} a - The first body to check.
     * @returns boolean - True if a's extent is less than b's extent
     */
    inOrder: function(a, b)
    {
        return Math.abs(this.rd(a) - this.lu(b)) <= Math.abs(this.rd(b) - this.lu(a));
    },

    /**
     * Offsets the position of a body, as well as
     *
     * @method Phaser.Physics.Arcade.BaseAxis#displaceTo
     * @since 3.54.0
     *
     * @param {Phaser.Physics.Arcade.Body} body - The body to modify.
     * @param {number} offset - The amount to add to the Body position.
     * @param {number} [v] - The amount to *set* Body velocity to.
     * @param {boolean} [blockLu=false] - Set the blocked.left/up value?
     * @param {boolean} [blockRd=false] - Set the blocked.right/bottom value?
     */
    displaceTo: function (body, offset, v, blockLu, blockRd)
    {
        if (offset !== null & offset !== undefined)
        {
            this.inc(body.position, offset);
            body.updateCenter();
        }
        if (v !== null && v !== undefined)
        {
            this.set(body.velocity, v);
        }
        if (blockLu || blockRd)
        {
            this.setEdges(body.blocked, blockLu, blockRd);
        }
    },
    /** Standard toString method. */
    toString: function ()
    {
        return '' + this.name + '-axis';
    },
});

/**
 * The holder for a class of single-axis projectors for arcade bodies.
 *
 * This lets algorithms be generic in X and Y, since this class specifies X and Y for them!
 *
 * This is used internally in overlap & separation logic to provide per-axis calculations which would otherwise be repetitive and bug prone. Instead, the code is merely invoked with a reference to the necessary axis!
 *
 * @namespace Axis
 * @memberof Phaser.Physics.Arcade
 * @since 3.54.0
 */
var Axis = {
    /**
     * @classdesc
     * Projects objects into the horizontal direction.
     *
     * @class X
     * @extends Phaser.Physics.Arcade.BaseAxis
     * @since 3.54.0
     */
    X: new (new Class({
        Extends: BaseAxis,
        /** @inheritdoc */
        get: function(v)
        {
            return v.x;
        },
        /** @inheritdoc */
        set: function(v, val)
        {
            return v.x = val;
        },
        /** @inheritdoc */
        lu: function(v)
        {
            return v.left;
        },
        /** @inheritdoc */
        rd: function(v)
        {
            return v.right;
        },
        /** @inheritdoc */
        setEdges: function(v, lu, rd)
        {
            v.up = lu || v.up;
            v.down = rd || v.down;
            v.none = v.none && !v.up && !v.down;
        },
        /** @inheritdoc */
        getCustomSeparate: function(v)
        {
            return v.customSeparateX;
        },
    }))('X', Vector2.RIGHT.clone()),
    /**
     * @classdesc
     * Projects objects into the vertical direction.
     *
     * @class Y
     * @extends Phaser.Physics.Arcade.BaseAxis
     * @since 3.54.0
     */
    Y: new (new Class({
        Extends: BaseAxis,
        /** @inheritdoc */
        get: function(v)
        {
            return v.y;
        },
        /** @inheritdoc */
        set: function(v, val)
        {
            return v.y = val;
        },
        /** @inheritdoc */
        lu: function(v)
        {
            return v.up;
        },
        /** @inheritdoc */
        rd: function(v)
        {
            return v.down;
        },
        /** @inheritdoc */
        setEdges: function(v, lu, rd)
        {
            v.up = lu || v.up;
            v.down = rd || v.down;
            v.none = v.none && !v.up && !v.down;
        },
        /** @inheritdoc */
        getCustomSeparate: function(v)
        {
            return v.customSeparateY;
        },
    }))('Y', Vector2.DOWN.clone()),
};

/** @inheritdoc */
Axis.X.other = Axis.Y;
/** @inheritdoc */
Axis.Y.other = Axis.X;

module.exports = Axis;
