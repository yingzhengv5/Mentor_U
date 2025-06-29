using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Models.Enums;
using System.Text.Json;

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

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            var options = new JsonSerializerOptions();

            // Configure User's enum collections to be stored as JSON
            modelBuilder.Entity<User>()
                .Property(u => u.Skills)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, options),
                    v => JsonSerializer.Deserialize<HashSet<TechSkill>>(v ?? "[]", options) ?? new HashSet<TechSkill>());

            modelBuilder.Entity<User>()
                .Property(u => u.WillingToLearnSkills)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, options),
                    v => JsonSerializer.Deserialize<HashSet<TechSkill>>(v ?? "[]", options) ?? new HashSet<TechSkill>());

            modelBuilder.Entity<User>()
                .Property(u => u.JobTitle)
                .HasConversion(
                    v => JsonSerializer.Serialize(v, options),
                    v => JsonSerializer.Deserialize<HashSet<JobTitle>>(v ?? "[]", options) ?? new HashSet<JobTitle>());

            // Configure unique email constraint
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

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
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}