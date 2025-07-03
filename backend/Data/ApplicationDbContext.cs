using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Models.Enums;

namespace backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupMember> GroupMembers { get; set; }
        public DbSet<Mentorship> Mentorships { get; set; }
        public DbSet<Friendship> Friendships { get; set; }
        public DbSet<Message> Messages { get; set; }
        public DbSet<JobTitle> JobTitles { get; set; }
        public DbSet<Skill> Skills { get; set; }
        public DbSet<UserSkill> UserSkills { get; set; }
        public DbSet<UserWillingToLearnSkill> UserWillingToLearnSkills { get; set; }
        public DbSet<UserJobTitle> UserJobTitles { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure unique email constraint
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Configure Friendship relationships
            modelBuilder.Entity<Friendship>()
                .HasOne(f => f.Requester)
                .WithMany(u => u.RequestedFriendships)
                .HasForeignKey(f => f.RequesterId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Friendship>()
                .HasOne(f => f.Receiver)
                .WithMany(u => u.ReceivedFriendships)
                .HasForeignKey(f => f.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Mentorship relationships
            modelBuilder.Entity<Mentorship>()
                .HasOne(m => m.Mentor)
                .WithMany(u => u.MentorMentorships)
                .HasForeignKey(m => m.MentorId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Mentorship>()
                .HasOne(m => m.Student)
                .WithMany(u => u.StudentMentorships)
                .HasForeignKey(m => m.StudentId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Mentorship>()
                .HasOne(m => m.Group)
                .WithMany(g => g.Mentorships)
                .HasForeignKey(m => m.GroupId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Message relationships
            modelBuilder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany(u => u.SentMessages)
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Message>()
                .HasOne(m => m.Receiver)
                .WithMany(u => u.ReceivedMessages)
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure composite key for GroupMembers
            modelBuilder.Entity<GroupMember>()
                .HasKey(gm => new { gm.GroupId, gm.UserId });

            // Configure relationships
            modelBuilder.Entity<GroupMember>()
                .HasOne(gm => gm.Group)
                .WithMany(g => g.Members)
                .HasForeignKey(gm => gm.GroupId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<GroupMember>()
                .HasOne(gm => gm.User)
                .WithMany(u => u.GroupMemberships)
                .HasForeignKey(gm => gm.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure composite keys for UserSkill
            modelBuilder.Entity<UserSkill>()
                .HasKey(us => new { us.UserId, us.SkillId });

            // Configure composite keys for UserWillingToLearnSkill
            modelBuilder.Entity<UserWillingToLearnSkill>()
                .HasKey(us => new { us.UserId, us.SkillId });

            // Configure composite keys for UserJobTitle
            modelBuilder.Entity<UserJobTitle>()
                .HasKey(uj => new { uj.UserId, uj.JobTitleId });

            // Configure unique constraint for JobTitle name
            modelBuilder.Entity<JobTitle>()
                .HasIndex(j => j.name)
                .IsUnique();

            // Configure unique constraint for Skill name
            modelBuilder.Entity<Skill>()
                .HasIndex(s => s.name)
                .IsUnique();
        }
    }
}