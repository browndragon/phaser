/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2020 Photon Storm Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */

var axis;
var body1;
var body2;
var body1Pushable;
var body2Pushable;
var body1MassImpact;
var body2MassImpact;
var body1FullImpact;
var body2FullImpact;
// TODO: Rename with min/max-y names.
var body1MovingLeft;
var body1MovingRight;
var body1Stationary;
var body2MovingLeft;
var body2MovingRight;
var body2Stationary;
var body1OnLeft;
var body2OnLeft;
var overlap;

/**
 * Sets all of the local processing values and calculates the velocity exchanges.
 *
 * Then runs `BlockCheck` and returns the value from it.
 *
 * This method is called by `Phaser.Physics.Arcade.Separate` and should not be
 * called directly.
 *
 * @function Phaser.Physics.Arcade.Process.Set
 * @ignore
 * @since 3.50.0
 *
 * @param {Phaser.Physics.Arcade.Axis} ax - The axis of operation.
 * @param {Phaser.Physics.Arcade.Body} b1 - The first Body to separate.
 * @param {Phaser.Physics.Arcade.Body} b2 - The second Body to separate.
 * @param {number} ov - The overlap value.
 *
 * @return {number} The BlockCheck result. 0 = not blocked. 1 = Body 1 blocked. 2 = Body 2 blocked.
 */
var Set = function (ax, b1, b2, ov)
{
    axis = ax;
    body1 = b1;
    body2 = b2;

    var v1 = axis.get(body1.velocity);
    var v2 = axis.get(body2.velocity);
    var d1 = axis.delta(body1.position, body1.prev);
    var d2 = axis.delta(body2.position, body2.prev);

    body1Pushable = body1.pushable;
    body1MovingLeft = d1 < 0;
    body1MovingRight = d1 > 0;
    body1Stationary = d1 === 0;
    body1OnLeft = axis.inOrder(body1, body2);
    body1FullImpact = v2 - v1 * axis.get(body1.bounce);

    body2Pushable = body2.pushable;
    body2MovingLeft = d2 < 0;
    body2MovingRight = d2 > 0;
    body2Stationary = d2 === 0;
    body2OnLeft = !body1OnLeft;
    body2FullImpact = v1 - v2 * axis.get(body2.bounce);

    //  negative delta = up, positive delta = down (inc. gravity)
    overlap = Math.abs(ov);

    return BlockCheck();
};

/**
 * Blocked Direction checks, because it doesn't matter if an object can be pushed
 * or not, blocked is blocked.
 *
 * @function Phaser.Physics.Arcade.Process.BlockCheck
 * @ignore
 * @since 3.50.0
 *
 * @return {number} The BlockCheck result. 0 = not blocked. 1 = Body 1 blocked. 2 = Body 2 blocked.
 */
var BlockCheck = function ()
{
    //  Body1 is moving right and Body2 is blocked from going right any further
    if (body1MovingRight && body1OnLeft && axis.rd(body2.blocked))
    {
        axis.displaceTo(body1, -overlap, body1FullImpact, undefined, true);
        return 1;
    }

    //  Body1 is moving up and Body2 is blocked from going up any further
    if (body1MovingLeft && body2OnLeft && axis.lu(body2.blocked))
    {
        axis.displaceTo(body1, overlap, body1FullImpact, true, undefined);
        return 1;
    }

    //  Body2 is moving right and Body1 is blocked from going right any further
    if (body2MovingRight && body2OnLeft && axis.rd(body1.blocked.right))
    {
        axis.displaceTo(body2, -overlap, body2FullImpact, undefined, true);
        return 2;
    }

    //  Body2 is moving up and Body1 is blocked from going up any further
    if (body2MovingLeft && body1OnLeft && body1.blocked.left)
    {
        axis.displaceTo(body2, overlap, body2FullImpact, true, undefined);
        return 2;
    }

    return 0;
};

/**
 * The main check function. Runs through one of the four possible tests and returns the results.
 *
 * @function Phaser.Physics.Arcade.Process.Check
 * @ignore
 * @since 3.50.0
 *
 * @return {boolean} `true` if a check passed, otherwise `false`.
 */
var Check = function ()
{
    // See https://en.wikipedia.org/wiki/Center-of-momentum_frame
    var v1 = axis.get(body1.velocity);
    var v2 = axis.get(body2.velocity);

    var vRel = v1 - v2;
    var m1 = body1.mass;
    var m2 = body2.mass;
    var mTotal = m1 + m2;
    var centerOfMassVelocity = (m1 * v1 + m2 * v2) / (m1 + m2);
    // Velocities relative to the center of massVelocity of the collision:
    body1MassImpact = centerOfMassVelocity - axis.get(body1.bounce) * m2 * vRel / mTotal;
    body2MassImpact = centerOfMassVelocity + axis.get(body2.bounce) * m1 * vRel / mTotal;

    //  Body1 hits Body2 on the right hand side
    if (body1MovingLeft && body2OnLeft)
    {
        return Run(0);
    }

    //  Body2 hits Body1 on the right hand side
    if (body2MovingLeft && body1OnLeft)
    {
        return Run(1);
    }

    //  Body1 hits Body2 on the left hand side
    if (body1MovingRight && body1OnLeft)
    {
        return Run(2);
    }

    //  Body2 hits Body1 on the left hand side
    if (body2MovingRight && body2OnLeft)
    {
        return Run(3);
    }

    return false;
};

/**
 * The main check function. Runs through one of the four possible tests and returns the results.
 *
 * @function Phaser.Physics.Arcade.Process.Run
 * @ignore
 * @since 3.50.0
 *
 * @param {number} side - The side to test. As passed in by the `Check` function.
 *
 * @return {boolean} Always returns `true`.
 */
var Run = function (side)
{
    // Amount of restitution in position:
    var body1OverlapShare = 0;
    var body2OverlapShare = 0;
    // Amount of restitution in velocity:
    var body1Impact = null;
    var body2Impact = null;

    if (body1Pushable && body2Pushable) {
        // Since everyone is pushable, separate the bodies based on mass.
        var totalMass = (body1.mass + body2.mass);
        body1OverlapShare = body2.mass / totalMass;  // Old code just did 0.5
        body2OverlapShare = 1 - body1OverlapShare;
        body1Impact = body1MassImpact;
        body2Impact = body2MassImpact;
    } else if (body1Pushable) {
        // Only 1 body pushable; it absorbs the full impact and is blocked.
        body1OverlapShare = 1;
        body1Impact = body1FullImpact;
    } else if (body2Pushable) {
        // Only 1 body pushable; it absorbs the full impact and is blocked.
        body2OverlapShare = 1;
        body2Impact = body2FullImpact;
    } else {
        // Nobody is pushable :( Base it on movement, with no mass transfer of velocity.
        // I'm not sure this is sensible.
        // If only one is moving, let it absorb the full restoration; if they're moving antiparallel, cancel velocities; if they're parallel, apply a push *if needed* (preexisting code always applied it).
        if (!body1Stationary && !body2Stationary) {  // Neither is stationary. Figure out the mass of the collision:
            var v1 = axis.get(body1.velocity);
            var v2 = axis.get(body2.velocity);
            var totalMass = (body1.mass + body2.mass);
            body1OverlapShare = body2.mass / totalMass;  // Old code just did 0.5
            body2OverlapShare = 1 - body1OverlapShare;
            if (body1MovingLeft && body2MovingLeft) {
                body1Impact = body1OnLeft ? Math.min(v1, v2) : null;
                body2Impact = body2OnLeft ? Math.min(v1, v2) : null;
            } else if (body1MovingRight && body2MovingRight) {
                body1Impact = body1OnLeft ? null : Math.max(v1, v2);
                body2Impact = body2OnLeft ? null : Math.max(v1, v2);
            } else {  // One is positive, one is negative. Cancel velocities entirely!
                body1Impact = 0;
                body2Impact = 0;
            }
        } else if (body1Stationary) {  // One of them is still. We *had* a collision, so the other one is converging.
            body2Impact = 0;
        } else if (body2Stationary) {
            body1Impact = 0;
        }
    }
    // Okay, having gathered our logic, now we just apply based on direction of collision:
    switch (side) {
        case 0:  // Fallthrough
        case 3:
            // Sides 0 and 3 -- that is,
            //  body1MovingLeft && body2OnLeft
            //  body2MovingRight && body2OnLeft
            // -- mean that body *1* gets rebuffed rightwards.
            axis.displaceTo(body1, overlap * body1OverlapShare, body1Impact, !body2Pushable, undefined);
            axis.displaceTo(body2, -overlap * body1OverlapShare, body2Impact, undefined, !body1Pushable);
            break;
        case 1:  // Fallthrough
        case 2:
            // Sides 1 and 2 --
            //  Body2 hits Body1 on the left side
            //  Body1 hits Body2 on the right side
            // -- mean that body *2* gets rebuffed leftwards.
            axis.displaceTo(body1, -overlap * body1OverlapShare, body1Impact, undefined, !body2Pushable);
            axis.displaceTo(body2, overlap * body1OverlapShare, body2Impact, !body1Pushable, undefined);
            break;
        default: throw 'what side?'
    }
    return true;
};

/**
 * This function is run when Body1 is Immovable and Body2 is not.
 *
 * @function Phaser.Physics.Arcade.Process.RunImmovableBody1
 * @ignore
 * @since 3.50.0
 *
 * @param {number} blockedState - The block state value.
 */
var RunImmovableBody1 = function (blockedState)
{
    if (blockedState === 1)
    {
        //  But Body2 cannot go anywhere either, so we cancel out velocity
        //  Separation happened in the block check
        axis.set(body2.velocity, 0);
    }
    else if (body1OnLeft)
    {
        axis.displaceTo(body2, overlap, body2FullImpact, true, undefined);
    }
    else
    {
        axis.displaceTo(body2, -overlap, body2FullImpact, undefined, true);
    }

    //  This is special case code that handles things like vertically moving platforms you can ride
    if (body1.moves)
    {
        var body1Delta = axis.other.get(body1.position) - axis.other.get(body1.prev);
        var body1Friction = axis.other.get(body1.friction);
        var newOther = axis.other.get(body2.position) + body1Friction * body1Delta;
        axis.other.set(body2.position, newOther);
    }
};

/**
 * This function is run when Body2 is Immovable and Body1 is not.
 *
 * @function Phaser.Physics.Arcade.Process.RunImmovableBody2
 * @ignore
 * @since 3.50.0
 *
 * @param {number} blockedState - The block state value.
 */
var RunImmovableBody2 = function (blockedState)
{
    if (blockedState === 2)
    {
        //  But Body1 cannot go anywhere either, so we cancel out velocity
        //  Separation happened in the block check
        axis.get(body1.velocity, 0);
    }
    else if (body2OnLeft)
    {
        axis.displaceTo(body1, overlap, body1FullImpact, true, undefined);
    }
    else
    {
        axis.displaceTo(body1, -overlap, body1FullImpact, undefined, true);
    }

    //  This is special case code that handles things like vertically moving platforms you can ride
    if (body2.moves)
    {
        var body2Delta = axis.other.get(body2.position) - axis.other.get(body2.prev);
        var body2Friction = axis.other.get(body2.friction);
        var newOther = axis.other.get(body1.position) + body2Friction * body2Delta;
        axis.other.set(body1.position, newOther);
    }
};

/**
 * @namespace Phaser.Physics.Arcade.Process
 * @ignore
 */

module.exports = {
    BlockCheck: BlockCheck,
    Check: Check,
    Set: Set,
    Run: Run,
    RunImmovableBody1: RunImmovableBody1,
    RunImmovableBody2: RunImmovableBody2
};
