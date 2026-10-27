import Image from 'next/image';

const COURSES = [
  {
    title: 'Bronze → Platinum Kurzus',
    range: 'Bronze – Platinum',
    image: '/kurzus-bronz-plat.jpg',
  },
  {
    title: 'Diamond → Grand Champion Kurzus',
    range: 'Diamond – GC',
    image: '/kurzus-dia-gc.jpg',
  },
  {
    title: 'Grand Champion 2 → SSL Kurzus',
    range: 'GC2 – SSL',
    image: '/kurzus-gc2-ssl.jpg',
  },
  {
    title: 'Mentál Kurzus',
    range: 'Minden rang',
    image: '/kurzus-mentál.jpg',
  },
];

export default function CourseBand() {
  return (
    <section aria-label="Kurzusok">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-8 pt-8 md:flex-row md:items-end md:justify-between md:px-8 md:pb-10 md:pt-16">
        <h2 className="text-[clamp(2.8rem,7vw,5.5rem)] font-black leading-[0.9] tracking-[-0.04em] text-white">
          A kurzusok.
        </h2>
        <p className="max-w-xs text-sm leading-relaxed text-white/45">
          A tagság része. Bronztól SSL-ig, plusz a mentál.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-px bg-black sm:grid-cols-2">
        {COURSES.map((course) => (
          <article key={course.title} className="group relative aspect-[16/10] overflow-hidden bg-black">
            <Image
              src={course.image}
              alt={`${course.title} — ${course.range}`}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
            />
          </article>
        ))}
      </div>
    </section>
  );
}
