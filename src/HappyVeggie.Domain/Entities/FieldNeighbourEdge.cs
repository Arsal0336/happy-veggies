namespace HappyVeggie.Domain.Entities;

public sealed class FieldNeighbourEdge
{
    public Guid Id { get; set; }

    public Guid FarmId { get; set; }

    // CropZone IDs (fields on the same farm).
    public Guid CropZoneAId { get; set; }
    public Guid CropZoneBId { get; set; }

    public string AdjacencyType { get; set; } = "adjacent";

    public string Source { get; set; } = "manual_or_admin";

    public bool Enabled { get; set; } = true;
}

