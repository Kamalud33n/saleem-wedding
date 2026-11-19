"use client";

import { Component } from "react";

/**
 * Prevents a single client runtime error from leaving guests on a blank page
 * (common in constrained in-app browsers / webviews).
 */
export default class InviteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[invite] runtime error:", error, info);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-ivory px-6 text-center text-ink sm:min-h-[100svh]">
          <p className="font-display text-2xl italic text-peacock">
            Saleem &amp; Barakkath
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
            Something went wrong loading the invitation. Please try again.
          </p>
          <button
            type="button"
            onClick={this.handleRetry}
            className="mt-6 min-h-11 rounded-full bg-peacock px-6 text-sm text-parchment"
          >
            Reload invitation
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
