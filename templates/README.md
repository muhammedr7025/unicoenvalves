# Unicorn Valves - Data Templates

This folder contains CSV templates for bulk importing pricing and configuration data.

## How to Use

1. Go to **Admin Panel** in the application
2. Navigate to the appropriate section:
   - **Admin > Pricing** - for most collections
   - **Admin > Machine Pricing** - for machining prices
3. Download the template (or use these CSV files)
4. Fill in your production data
5. Import using "Import from File" button

## Template Files

### Core Configuration
| File | Admin Section | Description |
|------|---------------|-------------|
| `materials.csv` | Pricing > Materials | Material names, prices per kg, and groups |
| `series.csv` | Pricing > Series | Valve series definitions with cage/seal ring flags |

### Component Weights (for Material Cost = Weight × Price/kg)
| File | Admin Section | Description |
|------|---------------|-------------|
| `body_weights.csv` | Pricing > Body Weights | Body weights by Series + Size + Rating + End Connect |
| `bonnet_weights.csv` | Pricing > Bonnet Weights | Bonnet weights by Series + Size + Rating + Bonnet Type |
| `plug_weights.csv` | Pricing > Plug Weights | Plug weights by Series + Size + Rating |
| `seat_weights.csv` | Pricing > Seat Weights | Seat weights by Series + Size + Rating |
| `cage_weights.csv` | Pricing > Cage Weights | Cage weights (only for series with hasCage=TRUE) |

### Fixed Prices (direct price lookup)
| File | Admin Section | Description |
|------|---------------|-------------|
| `stem_fixed_prices.csv` | Pricing > Stem Fixed Prices | Stem prices by Series + Size + Rating + Material |
| `seal_ring_prices.csv` | Pricing > Seal Ring Prices | Seal ring prices (only for series with hasSealRing=TRUE) |
| `actuator_models.csv` | Pricing > Actuator Models | Actuator prices by Type + Series + Model |
| `handwheel_prices.csv` | Pricing > Handwheel Prices | Handwheel prices by Type + Series + Model |

### Machining Prices (CRITICAL)
| File | Admin Section | Description |
|------|---------------|-------------|
| `machining_prices.csv` | Machine Pricing | Machining costs for each component |

## Data Relationships

```
           ┌─────────────────────────────────────────────────────────────────┐
           │                        PRICE CALCULATION                        │
           └─────────────────────────────────────────────────────────────────┘
                                         │
    ┌────────────────────────────────────┼────────────────────────────────────┐
    │                                    │                                    │
    ▼                                    ▼                                    ▼
┌─────────────┐                ┌─────────────┐               ┌─────────────────┐
│ WEIGHT ×    │                │ FIXED       │               │ MACHINING       │
│ PRICE/KG    │                │ PRICES      │               │ PRICES          │
└─────────────┘                └─────────────┘               └─────────────────┘
    │                                │                               │
    ├── Body                         ├── Stem                        ├── Body
    ├── Bonnet                       ├── Seal Ring                   ├── Bonnet
    ├── Plug                         ├── Actuator                    ├── Plug
    ├── Seat                         └── Handwheel                   ├── Seat
    └── Cage                                                         ├── Stem
                                                                     └── Cage
```

## Machining Prices - TypeKey Reference

| Component | TypeKey Field | Example Values |
|-----------|---------------|----------------|
| Body | End Connect Type | Flanged, Threaded, Butt-Weld |
| Bonnet | Bonnet Type | Standard, Extended, Bellows |
| Plug | Trim Type | Metal Seated, Soft Seated, Standard |
| Seat | Trim Type | Metal Seated, Soft Seated, Standard |
| Stem | Trim Type | Standard, Extended |
| Cage | Trim Type | Standard, Balanced |

## Important Notes

1. **Series Number** must match exactly between files
2. **Material Name** in machining_prices must match material names in materials.csv
3. **Import Order**: 
   - First: Materials and Series
   - Then: Weights and Fixed Prices
   - Finally: Machining Prices (references series)
4. **Active Flag**: Set to TRUE for production data, FALSE for test data

## Validation Checklist

Before going to production, verify:

- [ ] All series have corresponding entry in each weight table
- [ ] All size/rating combinations are covered
- [ ] All materials have prices set
- [ ] Machining prices exist for all component + series + size + rating + type + material combinations
- [ ] Actuator and Handwheel models are complete
- [ ] Seal ring prices exist for series with hasSealRing=TRUE
- [ ] Cage weights exist for series with hasCage=TRUE
