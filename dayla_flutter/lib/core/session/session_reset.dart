import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'package:dayla_flutter/features/auth/application/providers/notification_providers.dart';
import 'package:dayla_flutter/features/billing/application/providers/billing_providers.dart';
import 'package:dayla_flutter/features/chat/application/providers/chat_providers.dart';
import 'package:dayla_flutter/features/community/application/providers/community_providers.dart';
import 'package:dayla_flutter/features/dashboard/application/providers/budget_providers.dart';
import 'package:dayla_flutter/features/dashboard/application/providers/dashboard_providers.dart';
import 'package:dayla_flutter/features/memories/application/providers/memory_providers.dart';
import 'package:dayla_flutter/features/packing/application/providers/packing_providers.dart';
import 'package:dayla_flutter/features/piko/application/providers/piko_providers.dart';

/// Every provider that caches account-specific data. Invalidating this set
/// tears down all of one user's in-memory state so the next account starts
/// from a clean slate — no stale trips/boards/chats/etc. surviving a logout.
///
/// This is the single source of truth for "what belongs to the signed-in
/// user": when a new user-scoped provider is added, register it HERE and
/// account isolation is preserved automatically, instead of every screen
/// having to remember to clear itself.
///
/// Invalidating a family provider (budget, packing, message threads, route
/// detail…) clears ALL of its cached instances, so per-trip / per-id caches
/// are wiped too. Public catalogues (plan pricing, packing templates, the
/// public trail list metadata) are deliberately excluded — they hold no
/// account data and re-fetching them on every switch would waste bandwidth.
void resetUserScopedProviders(Ref ref) {
  // Dashboard / trips / boards
  ref.invalidate(tripsProvider);
  ref.invalidate(selectedTripProvider);
  ref.invalidate(budgetProvider);

  // Chat
  ref.invalidate(conversationsProvider);
  ref.invalidate(conversationMessagesProvider);

  // Community (feed carries per-user liked/saved flags)
  ref.invalidate(postsProvider);
  ref.invalidate(trendingPostsProvider);
  ref.invalidate(savedPostsProvider);

  // Notifications
  ref.invalidate(notificationsProvider);

  // Memories (Mriz)
  ref.invalidate(memoriesProvider);
  ref.invalidate(memoryDetailProvider);

  // Billing / entitlements
  ref.invalidate(subscriptionProvider);

  // Piko trails (list carries per-user isSaved/isMine/userVote)
  ref.invalidate(pikoRoutesProvider);
  ref.invalidate(pikoSavedRoutesProvider);
  ref.invalidate(pikoPlansProvider);
  ref.invalidate(pikoRouteDetailProvider);
  ref.invalidate(pikoCommentsProvider);
  ref.invalidate(pikoFiltersProvider);

  // Packing (per-trip lists)
  ref.invalidate(packingListProvider);
}
