using System;
using backend.Models.Enums;
using backend.DTOs;

namespace backend.DTOs.Groups
{
    public class GroupMemberDto
    {
        public Guid UserId { get; set; }
        public UserDto User { get; set; } = null!;
        public RequestStatus Status { get; set; }
    }
}