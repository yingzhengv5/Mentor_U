using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using backend.DTOs.Groups;
using backend.Exceptions;
using backend.Services;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GroupController : ControllerBase
    {
        private readonly GroupService _groupService;
        private readonly ILogger<GroupController> _logger;

        public GroupController(GroupService groupService, ILogger<GroupController> logger)
        {
            _groupService = groupService;
            _logger = logger;
        }

        /// <summary>
        /// Creates a new group
        /// </summary>
        /// <remarks>
        /// Only students can create groups. The creator automatically becomes a member.
        /// </remarks>
        [HttpPost]
        public async Task<ActionResult<GroupDto>> CreateGroup(CreateGroupDto dto)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new UnauthorizedException("User not authenticated"));

            var group = await _groupService.CreateGroupAsync(userId, dto);
            return CreatedAtAction(nameof(GetGroup), new { id = group.Id }, group);
        }

        /// <summary>
        /// Gets a specific group by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<GroupDto>> GetGroup(Guid id)
        {
            return await _groupService.GetGroupDtoAsync(id);
        }

        /// <summary>
        /// Gets all groups the current user is a member of
        /// </summary>
        [HttpGet("my")]
        public async Task<ActionResult<List<GroupDto>>> GetMyGroups()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new UnauthorizedException("User not authenticated"));

            return await _groupService.GetUserGroupsAsync(userId);
        }

        /// <summary>
        /// Requests to join a group
        /// </summary>
        [HttpPost("{id}/join")]
        public async Task<ActionResult<GroupMemberDto>> JoinGroup(Guid id)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new UnauthorizedException("User not authenticated"));

            return await _groupService.JoinGroupAsync(userId, id);
        }

        /// <summary>
        /// Responds to a group join request
        /// </summary>
        /// <remarks>
        /// Only the group creator can respond to join requests
        /// </remarks>
        [HttpPut("{id}/members/{userId}")]
        public async Task<ActionResult<GroupMemberDto>> RespondToJoinRequest(
            Guid id,
            Guid userId,
            [FromQuery] bool accept)
        {
            var currentUserId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new UnauthorizedException("User not authenticated"));

            // Verify current user is the group creator
            var group = await _groupService.GetGroupDtoAsync(id);
            if (group.CreatorId != currentUserId)
            {
                throw new UnauthorizedException("Only group creator can respond to join requests");
            }

            return await _groupService.RespondToJoinRequestAsync(id, userId, accept);
        }

        /// <summary>
        /// Allows a user to leave a group they are a member of
        /// </summary>
        [HttpPost("{id}/leave")]
        public async Task<ActionResult> LeaveGroup(Guid id)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new UnauthorizedException("User not authenticated"));

            await _groupService.LeaveGroupAsync(userId, id);
            return NoContent();
        }

        /// <summary>
        /// Allows a creator to delete their group
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteGroup(Guid id)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new UnauthorizedException("User not authenticated"));

            await _groupService.DeleteGroupAsync(userId, id);
            return NoContent();
        }
    }
}