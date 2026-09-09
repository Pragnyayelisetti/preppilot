import mongoose, { Schema } from 'mongoose';

/**
 * PrepPilot currently runs as a single-user demo app (one in-memory
 * `appState` object shared by every route — see ../state.ts).
 *
 * Rather than force a big rewrite of every route into per-collection
 * MongoDB queries, we persist that same appState object as ONE document
 * in a `app_states` collection, keyed by `key: "singleton"`.
 *
 * - On server startup we load this document (if it exists) into the
 *   in-memory appState, so data survives restarts.
 * - After every request that could have changed data, we save the
 *   in-memory appState back into this same document.
 *
 * If you later want proper multi-user support, split this into real
 * collections (User, Opportunity, SyncedEmail, Notification, ...) —
 * the shape of AppState in state.ts is the place to start from.
 */
const AppStateSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, default: 'singleton' },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true, minimize: false }
);

export const AppStateModel = mongoose.model('AppState', AppStateSchema);
