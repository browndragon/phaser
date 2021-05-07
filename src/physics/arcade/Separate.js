/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2020 Photon Storm Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */

var GetOverlap = require('./GetOverlap');
var Process = require('./Process');

/**
 * Separates two overlapping bodies on the given axis.
 *
 * Separation involves moving two overlapping bodies so they don't overlap anymore and adjusting their velocities based on their properties like mass, friction, bounce, etc. This is a core part of collision detection.
 *
 * The bodies won't be separated if there is no axial overlap between them, if they are static, or if either one uses custom logic for its separation.
 *
 * @function Phaser.Physics.Arcade.SeparateX
 * @since 3.0.0
 *
 * @param {Phaser.Physics.Arcade.Axis} axis - The axis on which to separate.
 * @param {Phaser.Physics.Arcade.Body} body1 - The first Body to separate.
 * @param {Phaser.Physics.Arcade.Body} body2 - The second Body to separate.
 * @param {boolean} overlapOnly - If `true`, the bodies will only have their overlap data set and no separation will take place.
 * @param {number} bias - A value to add to the delta value during overlap checking. Used to prevent sprite tunneling.
 *
 * @return {boolean} `true` if the two bodies overlap axially, otherwise `false`.
 */
var Separate = function (axis, body1, body2, overlapOnly, bias)
{
    var overlap = GetOverlap(axis, body1, body2, overlapOnly, bias);

    var body1Immovable = body1.immovable;
    var body2Immovable = body2.immovable;

    //  Can't separate two immovable bodies, or a body with its own custom separation logic
    if (overlapOnly
        || overlap === 0
        || (body1Immovable && body2Immovable)
        || axis.getCustomSeparate(body1)
        || axis.getCustomSeparate(body2))
    {
        //  return true if there was some overlap, otherwise false
        return (overlap !== 0) || (body1.embedded && body2.embedded);
    }

    var blockedState = Process.Set(axis, body1, body2, overlap);

    if (!body1Immovable && !body2Immovable)
    {
        if (blockedState > 0)
        {
            return true;
        }

        return Process.Check();
    }
    else if (body1Immovable)
    {
        Process.RunImmovableBody1(blockedState);
    }
    else if (body2Immovable)
    {
        Process.RunImmovableBody2(blockedState);
    }

    //  If we got this far then there WAS overlap, and separation is complete, so return true
    return true;
};

module.exports = Separate;
