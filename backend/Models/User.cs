using System.ComponentModel.DataAnnotations;
using backend.Models.Enums;

namespace backend.Models
{
	public class User
	{
		public User()
		{
			// Initial value
			JobTitles = new List<UserJobTitle>();
			Skills = new List<UserSkill>();
			WillingToLearnSkills = new List<UserWillingToLearnSkill>();
			CreatedGroups = new List<Group>();
			GroupMemberships = new List<GroupMember>();
			MentorMentorships = new List<Mentorship>();
			StudentMentorships = new List<Mentorship>();
			RequestedFriendships = new List<Friendship>();
			ReceivedFriendships = new List<Friendship>();
			SentMessages = new List<Message>();
			ReceivedMessages = new List<Message>();
		}
		[Key]
		public Guid Id { get; set; }

		[Required]
		[EmailAddress]
		public required string Email { get; set; }

		[Required]
		public required string Password { get; set; }

		[Required]
		public required string FirstName { get; set; }

		[Required]
		public required string LastName { get; set; }

		[Required]
		public UserRole Role { get; set; }

		public string? Bio { get; set; }

		public string? ProfileImageUrl { get; set; }

		// Navigation properties
		public virtual ICollection<UserJobTitle> JobTitles { get; set; }
		public virtual ICollection<UserSkill> Skills { get; set; }
		public virtual ICollection<UserWillingToLearnSkill> WillingToLearnSkills { get; set; }
		public virtual ICollection<Group> CreatedGroups { get; set; }
		public virtual ICollection<GroupMember> GroupMemberships { get; set; }
		public virtual ICollection<Mentorship> MentorMentorships { get; set; }
		public virtual ICollection<Mentorship> StudentMentorships { get; set; }
		public virtual ICollection<Friendship> RequestedFriendships { get; set; }
		public virtual ICollection<Friendship> ReceivedFriendships { get; set; }
		public virtual ICollection<Message> SentMessages { get; set; }
		public virtual ICollection<Message> ReceivedMessages { get; set; }
	}
}


