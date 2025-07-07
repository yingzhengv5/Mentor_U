using System;
using System.Collections.Generic;
using backend.DTOs;

namespace backend.DTOs.Groups
{
    public class GroupDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Guid CreatorId { get; set; }
        public UserDto Creator { get; set; } = null!;
        public List<GroupMemberDto> Members { get; set; } = new List<GroupMemberDto>();
        public DateTime CreatedAt { get; set; }
    }
}