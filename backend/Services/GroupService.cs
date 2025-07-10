using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using backend.Data;
using backend.DTOs;
using backend.DTOs.Groups;
using backend.Exceptions;
using backend.Models;
using backend.Models.Enums;
using System.ComponentModel;

namespace backend.Services
{
    public class GroupService
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<GroupService> _logger;

        public GroupService(ApplicationDbContext context, ILogger<GroupService> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Creates a new group with the given student as the creator
        /// </summary>
        /// <param name="creatorId">ID of the student creating the group</param>
        /// <param name="dto">Group creation data</param>
        /// <returns>The created group</returns>
        public async Task<GroupDto> CreateGroupAsync(Guid creatorId, CreateGroupDto dto)
        {
            // Verify that the creator exists and is a student
            var creator = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == creatorId && u.Role == UserRole.Student)
                ?? throw new UnauthorizedException("Only students can create groups");

            // Create new group
            var group = new Group
            {
                Name = dto.Name,
                Description = dto.Description,
                CreatorId = creatorId,
                CreatedAt = DateTime.UtcNow,
                Creator = creator
            };

            _context.Groups.Add(group);

            // Add creator as a member automatically
            var creatorMembership = new GroupMember
            {
                GroupId = group.Id,
                UserId = creatorId,
                Status = RequestStatus.Accepted,
                Group = group,
                User = creator
            };

            _context.GroupMembers.Add(creatorMembership);
            await _context.SaveChangesAsync();

            return await GetGroupDtoAsync(group.Id);
        }

        /// <summary>
        /// Retrieves a group by its ID with all related data
        /// </summary>
        /// <param name="groupId">ID of the group to retrieve</param>
        /// <returns>Group with all its members and creator information</returns>
        public async Task<GroupDto> GetGroupDtoAsync(Guid groupId)
        {
            var group = await _context.Groups
                .Include(g => g.Creator)
                .Include(g => g.Members)
                    .ThenInclude(m => m.User)
                .FirstOrDefaultAsync(g => g.Id == groupId)
                ?? throw new NotFoundException($"Group with ID {groupId} not found");

            return new GroupDto
            {
                Id = group.Id,
                Name = group.Name,
                Description = group.Description,
                CreatorId = group.CreatorId,
                Creator = new UserDto
                {
                    Id = group.Creator.Id,
                    FirstName = group.Creator.FirstName,
                    LastName = group.Creator.LastName,
                    Email = group.Creator.Email,
                    Role = group.Creator.Role
                },
                Members = group.Members.Select(m => new GroupMemberDto
                {
                    UserId = m.UserId,
                    User = new UserDto
                    {
                        Id = m.User.Id,
                        FirstName = m.User.FirstName,
                        LastName = m.User.LastName,
                        Email = m.User.Email,
                        Role = m.User.Role
                    },
                    Status = m.Status
                }).ToList(),
                CreatedAt = group.CreatedAt
            };
        }

        /// <summary>
        /// Gets all groups that a user is an accepted member of
        /// </summary>
        /// <param name="userId">ID of the user</param>
        /// <returns>List of groups the user is an accepted member of</returns>
        public async Task<List<GroupDto>> GetUserGroupsAsync(Guid userId)
        {
            // Get only groups where the user is an accepted member
            var memberships = await _context.GroupMembers
                .Where(gm => gm.UserId == userId && gm.Status == RequestStatus.Accepted)
                .Select(gm => gm.GroupId)
                .ToListAsync();

            var groups = new List<GroupDto>();
            foreach (var groupId in memberships)
            {
                groups.Add(await GetGroupDtoAsync(groupId));
            }

            return groups;
        }

        /// <summary>
        /// Handles a user's request to join a group
        /// </summary>
        /// <param name="userId">ID of the user requesting to join</param>
        /// <param name="groupId">ID of the group to join</param>
        /// <returns>The created group membership</returns>
        public async Task<GroupMemberDto> JoinGroupAsync(Guid userId, Guid groupId)
        {
            // Check if user and group exist
            var user = await _context.Users.FindAsync(userId)
                ?? throw new NotFoundException("User not found");

            var group = await _context.Groups
                .Include(g => g.Members)
                .FirstOrDefaultAsync(g => g.Id == groupId)
                ?? throw new NotFoundException("Group not found");

            // Check if user already has a membership
            var existingMembership = await _context.GroupMembers
                .FirstOrDefaultAsync(gm => gm.GroupId == groupId && gm.UserId == userId);

            if (existingMembership != null)
            {
                throw new BadRequestException("You have already joined or requested to join this group");
            }

            // Create new membership request
            var membership = new GroupMember
            {
                GroupId = groupId,
                UserId = userId,
                Status = RequestStatus.Pending,
                Group = group,
                User = user
            };

            _context.GroupMembers.Add(membership);
            await _context.SaveChangesAsync();

            return new GroupMemberDto
            {
                UserId = userId,
                User = new UserDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Email = user.Email,
                    Role = user.Role
                },
                Status = membership.Status
            };
        }

        /// <summary>
        /// Handles the group creator's response to a join request
        /// </summary>
        /// <param name="groupId">ID of the group</param>
        /// <param name="userId">ID of the user who requested to join</param>
        /// <param name="accept">Whether to accept or reject the request</param>
        /// <returns>The updated group membership</returns>
        public async Task<GroupMemberDto> RespondToJoinRequestAsync(Guid groupId, Guid userId, bool accept)
        {
            var membership = await _context.GroupMembers
                .Include(gm => gm.User)
                .Include(gm => gm.Group)
                .FirstOrDefaultAsync(gm => gm.GroupId == groupId && gm.UserId == userId)
                ?? throw new NotFoundException("Join request not found");

            if (membership.Status != RequestStatus.Pending)
            {
                throw new BadRequestException("This request is not pending");
            }

            membership.Status = accept ? RequestStatus.Accepted : RequestStatus.Rejected;
            await _context.SaveChangesAsync();

            return new GroupMemberDto
            {
                UserId = userId,
                User = new UserDto
                {
                    Id = membership.User.Id,
                    FirstName = membership.User.FirstName,
                    LastName = membership.User.LastName,
                    Email = membership.User.Email,
                    Role = membership.User.Role
                },
                Status = membership.Status
            };
        }

        /// <summary>
        /// Allows a user to leave a group
        /// </summary>
        public async Task LeaveGroupAsync(Guid userId, Guid groupId)
        {
            var membership = await _context.GroupMembers
                .Include(gm => gm.Group)
                .FirstOrDefaultAsync(gm => gm.GroupId == groupId &&
                                         gm.UserId == userId &&
                                         gm.Status == RequestStatus.Accepted)
                ?? throw new NotFoundException("Group membership not found");

            // Check if the user is the creator - creators can't leave, they must delete the group
            if (membership.Group.CreatorId == userId)
            {
                throw new BadRequestException("Group creators cannot leave the group. Please delete the group instead.");
            }

            _context.GroupMembers.Remove(membership);
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Allows a creator to delete their group
        /// This will remove all members and delete the group
        /// </summary>
        public async Task DeleteGroupAsync(Guid creatorId, Guid groupId)
        {
            var group = await _context.Groups
                .Include(g => g.Members)
                .FirstOrDefaultAsync(g => g.Id == groupId && g.CreatorId == creatorId)
                ?? throw new NotFoundException("Group not found");

            // Verify the user is the creator
            if (group.CreatorId != creatorId)
            {
                throw new UnauthorizedException("Only the group creator can delete the group");
            }

            // Remove all members first (to handle cascade delete properly)
            _context.GroupMembers.RemoveRange(group.Members);

            // Remove the group
            _context.Groups.Remove(group);

            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Gets all available groups with their members and creator information
        /// </summary>
        /// <returns>List of all groups</returns>
        public async Task<List<GroupDto>> GetAllGroupsAsync()
        {
            var groups = await _context.Groups
                .Include(g => g.Creator)
                .Include(g => g.Members)
                    .ThenInclude(m => m.User)
                .OrderByDescending(g => g.CreatedAt)
                .ToListAsync();

            return groups.Select(group => new GroupDto
            {
                Id = group.Id,
                Name = group.Name,
                Description = group.Description,
                CreatorId = group.CreatorId,
                Creator = new UserDto
                {
                    Id = group.Creator.Id,
                    FirstName = group.Creator.FirstName,
                    LastName = group.Creator.LastName,
                    Email = group.Creator.Email,
                    Role = group.Creator.Role
                },
                Members = group.Members.Select(m => new GroupMemberDto
                {
                    UserId = m.UserId,
                    User = new UserDto
                    {
                        Id = m.User.Id,
                        FirstName = m.User.FirstName,
                        LastName = m.User.LastName,
                        Email = m.User.Email,
                        Role = m.User.Role
                    },
                    Status = m.Status
                }).ToList(),
                CreatedAt = group.CreatedAt
            }).ToList();
        }
    }
}