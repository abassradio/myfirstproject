function FeatureCard({ title, description, tag }) {
  return (
    <article className="group rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:border-slate-900/20 hover:shadow-md">
      <div className="mb-3 inline-flex items-center rounded-full bg-slate-900/90 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
        {tag}
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">{description}</p>
    </article>
  )
}

export default FeatureCard
