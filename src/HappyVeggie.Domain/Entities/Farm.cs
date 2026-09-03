namespace HappyVeggie.Domain.Entities;

public sealed class Farm
{
    public Guid Id { get; set; }

    public Guid FarmerId { get; set; }

    public string? Name { get; set; }

    public decimal Lat { get; set; }

    public decimal Lng { get; set; }

    public string RegionCode { get; set; } = string.Empty;

    public string RegionLabel { get; set; } = string.Empty;

    public decimal AreaAcres { get; set; }

    public decimal AreaInputValue { get; set; }

    public string AreaInputUnit { get; set; } = "acre";

    public string? PreferredCropId { get; set; }

    public string? PreferredCropFreeText { get; set; }

    public bool IsNewFarmSetup { get; set; }

    public string? SoilType { get; set; }

    public bool? WaterAccess { get; set; }

    public string? WaterSource { get; set; }

    public decimal? BudgetAmount { get; set; }

    public string? BudgetCurrency { get; set; }

    public bool LetAiChooseCrop { get; set; }

    public bool IsDeleted { get; set; }

    public DateTimeOffset CreatedAt { get; set; }

    public DateTimeOffset UpdatedAt { get; set; }

    public Farmer Farmer { get; set; } = null!;

    public ICollection<ProductionArea> ProductionAreas { get; set; } = new List<ProductionArea>();
}
