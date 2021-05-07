/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2020 Photon Storm Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */

var CONST = require('./const');

/**
 * Calculates and returns the axial overlap between two arcade physics bodies and sets their properties
 * accordingly, including: `touching.left` (or up!), `touching.right` (or down!), `touching.none` and `overlapX' (or Y!).
 *
 * @function Phaser.Physics.Arcade.GetOverlap
 * @since 3.0.0
 *
 * @param {Phaser.Physics.Arcade.Axis} axis - The axis to separate along.
 * @param {Phaser.Physics.Arcade.Body} body1 - The first Body to separate.
 * @param {Phaser.Physics.Arcade.Body} body2 - The second Body to separate.
 * @param {boolean} overlapOnly - Is this an overlap only check, or part of separation?
 * @param {number} bias - A value added to the delta values during collision checks. Increase it to prevent sprite tunneling(sprites passing through another instead of colliding).
 *
 * @return {number} The amount of overlap.
 */
var GetOverlap = function (axis, body1, body2, overlapOnly, bias)
{
    var overlap = 0;
    var d1 = axis.get(body1.position) - axis.get(body1.prev);
    var d2 = axis.get(body2.position) - axis.get(body2.prev);
    var maxOverlap = Math.abs(d1) + Math.abs(d2) + bias;


    if (d1 === d2)  // Shouldn't this be === each other? ===0 leaves out cases!
    {
        //  They overlap but neither of them are moving
        body1.embedded = true;
        body2.embedded = true;
        //  Resets the overlapX to zero if there is no overlap, or to the actual pixel value if there is
        axis.set(body1.overlapV, 0);
        axis.set(body2.overlapV, 0);
        return 0;
    }
    var minBody = body1;
    var maxBody = body2;
    if (d1 < d2)
    {
        minBody = body2;
        maxBody = body1;
    }

    //  Body1 is moving right and / or Body2 is moving left
    overlap = axis.rd(minBody) - axis.lu(maxBody);

    if ((overlap > maxOverlap && !overlapOnly) || axis.rd(minBody.checkCollision) === false || axis.lu(maxBody.checkCollision) === false)
    {
        overlap = 0;
    }
    else
    {
        axis.setEdges(minBody.touching, undefined, true);
        axis.setEdges(maxBody.touching, true, undefined);

        if (maxBody.physicsType === CONST.STATIC_BODY && !overlapOnly)
        {
            axis.setEdges(minBody.blocked, undefined, true);
        }

        if (minBody.physicsType === CONST.STATIC_BODY && !overlapOnly)
        {
            axis.setEdges(maxBody.blocked, true, undefined);
        }
    }

    //  Resets the overlapX to zero if there is no overlap, or to the actual pixel value if there is
    axis.set(minBody.overlapV, overlap);
    axis.set(maxBody.overlapV, overlap);

    return overlap;
};

module.exports = GetOverlap;
