import torch
import torch.nn as nn
import torch.nn.functional as F

class TwoTower(nn.Module):
    """
    Two-Tower Recommendation Model (PyTorch)
    - User Tower: Embeds user IDs into dense representation.
    - Item Tower: Processes content feature vectors (specifications + text embeddings)
      allowing inference on cold-start items with zero prior interactions.
    """
    def __init__(self, n_users: int, content_dim: int, emb_dim: int = 32):
        super().__init__()
        self.n_users = n_users
        self.content_dim = content_dim
        self.emb_dim = emb_dim

        # User tower
        self.user_tower = nn.Sequential(
            nn.Embedding(n_users, 64),
        )
        self.user_proj = nn.Sequential(
            nn.Linear(64, 64),
            nn.ReLU(),
            nn.Linear(64, emb_dim)
        )

        # Item tower (generalizes to new catalog items via content vectors)
        self.item_tower = nn.Sequential(
            nn.Linear(content_dim, 128),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(128, emb_dim)
        )

    def user_embed(self, u: torch.Tensor) -> torch.Tensor:
        return self.user_proj(self.user_tower[0](u))

    def item_embed(self, content_vec: torch.Tensor) -> torch.Tensor:
        return self.item_tower(content_vec)

    def forward(self, u: torch.Tensor, item_content: torch.Tensor) -> torch.Tensor:
        u_emb = F.normalize(self.user_embed(u), dim=1)
        i_emb = F.normalize(self.item_embed(item_content), dim=1)
        # Cosine similarity scaled by 10
        return (u_emb * i_emb).sum(1) * 10.0


class MFModel(nn.Module):
    """
    Matrix Factorization baseline with User/Item biases
    """
    def __init__(self, n_users: int, n_items: int, n_factors: int = 32):
        super().__init__()
        self.user_factors = nn.Embedding(n_users, n_factors)
        self.item_factors = nn.Embedding(n_items, n_factors)
        self.user_biases = nn.Embedding(n_users, 1)
        self.item_biases = nn.Embedding(n_items, 1)

        nn.init.normal_(self.user_factors.weight, std=0.05)
        nn.init.normal_(self.item_factors.weight, std=0.05)
        nn.init.zeros_(self.user_biases.weight)
        nn.init.zeros_(self.item_biases.weight)

    def forward(self, u: torch.Tensor, i: torch.Tensor) -> torch.Tensor:
        dot = (self.user_factors(u) * self.item_factors(i)).sum(dim=-1)
        return dot + self.user_biases(u).squeeze(-1) + self.item_biases(i).squeeze(-1)


class NCF(nn.Module):
    """
    Neural Collaborative Filtering (GMF + MLP)
    """
    def __init__(self, n_users: int, n_items: int, gmf_dim: int = 16, mlp_dim: int = 32, mlp_layers = (64, 32, 16)):
        super().__init__()
        self.gmf_user = nn.Embedding(n_users, gmf_dim)
        self.gmf_item = nn.Embedding(n_items, gmf_dim)
        self.mlp_user = nn.Embedding(n_users, mlp_dim)
        self.mlp_item = nn.Embedding(n_items, mlp_dim)

        mlp_in = mlp_dim * 2
        layers = []
        for out_dim in mlp_layers:
            layers += [nn.Linear(mlp_in, out_dim), nn.ReLU(), nn.Dropout(0.1)]
            mlp_in = out_dim
        self.mlp = nn.Sequential(*layers)
        self.out = nn.Linear(gmf_dim + mlp_layers[-1], 1)

    def forward(self, u: torch.Tensor, i: torch.Tensor) -> torch.Tensor:
        gmf_out = self.gmf_user(u) * self.gmf_item(i)
        mlp_in = torch.cat([self.mlp_user(u), self.mlp_item(i)], dim=1)
        mlp_out = self.mlp(mlp_in)
        concat = torch.cat([gmf_out, mlp_out], dim=1)
        return self.out(concat).squeeze()
