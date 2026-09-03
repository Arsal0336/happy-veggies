namespace HappyVeggie.Domain.Entities;

public enum CropCompatibilityRelation
{
    Good = 0,
    Avoid = 1,
    Neutral = 2
}

public enum CropCompatibilityScope
{
    OnFarmNeighbour = 0,
    Portfolio = 1,
    NearbyRegion = 2,
    General = 3
}

public sealed class CropCompatibility
{
    public Guid Id { get; set; }

    public string CropAId { get; set; } = string.Empty;
    public string CropBId { get; set; } = string.Empty;

    public CropCompatibilityRelation Relation { get; set; }

    // Localized-ready reason text (for P0 we keep as plain string; UI can localize later).
    public string Reason { get; set; } = string.Empty;

    public CropCompatibilityScope Scope { get; set; }

    public bool Enabled { get; set; } = true;
}

