

export type ImagePlaceholder = {
  id: string;
  description: string;
  imageUrl: string;
  imageHint: string;
};

const data = {
  "placeholderImages": [
    {
      "id": "prod_img_1",
      "description": "A plate of scrambled eggs on toast",
      "imageUrl": "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=800",
      "imageHint": "scrambled eggs"
    },
    {
      "id": "prod_img_2",
      "description": "A smoked salmon bagel",
      "imageUrl": "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?q=80&w=800",
      "imageHint": "salmon bagel"
    },
    {
      "id": "prod_img_3",
      "description": "A glass of classic lemonade",
      "imageUrl": "https://images.unsplash.com/photo-1523905534024-9f71f61defb5?q=80&w=800",
      "imageHint": "lemonade"
    },
    {
      "id": "prod_img_4",
      "description": "An iced latte",
      "imageUrl": "https://images.unsplash.com/photo-1517701559435-50849842d067?q=80&w=800",
      "imageHint": "iced latte"
    },
    {
      "id": "landing_hero",
      "description": "A dashboard view of a POS system",
      "imageUrl": "https://images.unsplash.com/photo-1635183607544-bf69187cc310?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw1fHxkYXNoYm9hcmQlMjB1aXxlbnwwfHx8fDE3NzA2MDY4NTR8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "dashboard ui"
    },
    {
      "id": "landing_ss1",
      "description": "A checkout screen of a POS system",
      "imageUrl": "https://images.unsplash.com/photo-1707780398794-a2ebcfc0f82a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxjaGVja291dCUyMHNjcmVlbnxlbnwwfHx8fDE3NzA2MjIzOTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "checkout screen"
    },
    {
      "id": "landing_ss2",
      "description": "An inventory management screen of a POS system",
      "imageUrl": "https://images.unsplash.com/photo-1624927637280-f033784c1279?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwzfHxpbnZlbnRvcnklMjBtYW5hZ2VtZW50fGVufDB8fHx8MTc3MDYyMjM5OXww&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "inventory management"
    },
    {
      "id": "landing_ss3",
      "description": "An analytics dashboard of a POS system",
      "imageUrl": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxhbmFseXRpY3MlMjBkYXNoYm9hcmR8ZW58MHx8fHwxNzcwNTQzNTk2fDA&ixlib=rb-4.1.0&q=80&w=1080",
      "imageHint": "analytics dashboard"
    },
    {
      "id": "landing_hero_new",
      "description": "A dashboard UI for a business application",
      "imageUrl": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200",
      "imageHint": "dashboard ui"
    },
    {
      "id": "landing_feature_1",
      "description": "A point of sale checkout screen",
      "imageUrl": "https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?q=80&w=600",
      "imageHint": "pos checkout"
    },
    {
      "id": "landing_feature_2",
      "description": "A screen showing product management interface",
      "imageUrl": "https://images.unsplash.com/photo-1522204523234-8729aa6e3d5f?q=80&w=600",
      "imageHint": "product management"
    },
    {
      "id": "landing_feature_3",
      "description": "A screen with sales analytics charts",
      "imageUrl": "https://images.unsplash.com/photo-1606857521015-7f9fcf423740?q=80&w=600",
      "imageHint": "sales analytics"
    },
    {
      "id": "landing_feature_4",
      "description": "A report showing data from multiple stores",
      "imageUrl": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600",
      "imageHint": "multi store report"
    }
  ]
}

export const PlaceHolderImages: ImagePlaceholder[] = data.placeholderImages;
