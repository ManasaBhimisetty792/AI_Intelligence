import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FiAlertCircle,
  FiBriefcase,
  FiCalendar,
  FiCheckCircle,
  FiGlobe,
  FiLoader,
  FiMapPin,
  FiPhone,
  FiRefreshCw,
  FiSearch,
  FiUser,
  FiX,
} from "react-icons/fi";

import { HiSparkles } from "react-icons/hi";
import { toast } from "react-hot-toast";

import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import recruiterService from "../../services/recruiterService";

import {
  isSupabaseConfigured,
  supabase,
} from "../../services/supabaseClient";

import { tokenStorage } from "../../services/api";

import "./findRecruiters.css";

const DEFAULT_INTERVIEW_TYPES = [
  "Technical Interview",
  "HR Interview",
];

const getAvatarUrl = (
  name = "Recruiter",
  avatarUrl = ""
) => {
  if (avatarUrl) {
    return avatarUrl;
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=4f46e5&color=fff&size=128`;
};

const normalizeInterviewTypes = (row = {}) => {
  const rawValue =
    row.interview_types ??
    row.interviewTypes ??
    row.interview_type_options ??
    null;

  if (Array.isArray(rawValue)) {
    const values = rawValue
      .map((item) => String(item).trim())
      .filter(Boolean);

    if (values.length > 0) {
      return [...new Set(values)];
    }
  }

  if (typeof rawValue === "string") {
    const values = rawValue
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (values.length > 0) {
      return [...new Set(values)];
    }
  }

  return [...DEFAULT_INTERVIEW_TYPES];
};

const normalizeRecruiter = (row = {}) => {
  const name = row.full_name || "Recruiter";

  const experienceYears = Number(
    row.experience_years || 0
  );

  const techStack = [
    row.specialization,
    row.industry,
    row.designation,
  ].filter(Boolean);

  const isVerified =
    String(row.verification_status || "")
      .toLowerCase()
      .trim() === "verified";

  return {
    id: row.id,
    user_id: row.user_id,

    name,
    full_name: row.full_name || "",

    email: row.email || "",
    phone: row.phone || "",

    designation:
      row.designation || "Recruiter",

    company:
      row.company_name ||
      "Independent Recruiter",

    company_name: row.company_name || "",
    company_logo: row.company_logo || "",
    company_website:
      row.company_website || "",

    industry: row.industry || "",
    company_size: row.company_size || "",
    location: row.location || "Remote",

    experience_years: experienceYears,

    experience: `${experienceYears} ${
      experienceYears === 1 ? "Year" : "Years"
    }`,

    specialization:
      row.specialization || "",

    bio: row.bio || "",

    avatar_url: row.avatar_url || "",

    avatar: getAvatarUrl(
      name,
      row.avatar_url || ""
    ),

    techStack: [...new Set(techStack)],

    verification_status:
      row.verification_status || "Pending",

    isVerified,

    availabilityText: String(
      row.availability || ""
    ).trim(),

    interviewTypes:
      normalizeInterviewTypes(row),

    verified_at: row.verified_at || null,
    created_at: row.created_at || null,
    updated_at: row.updated_at || null,

    tax_id: row.tax_id || "",

    registration_doc_url:
      row.registration_doc_url || "",
  };
};

function SkeletonCard() {
  return (
    <div className="recruiter-card glass-card recruiter-skeleton-card">
      <div className="skeleton skeleton-avatar" />
      <div className="skeleton skeleton-line skeleton-line-large" />
      <div className="skeleton skeleton-line skeleton-line-medium" />
      <div className="skeleton skeleton-line skeleton-line-small" />
      <div className="skeleton skeleton-box" />
      <div className="skeleton skeleton-button" />
    </div>
  );
}

function AvailabilitySlots({
  availabilityText,
}) {
  const lines = String(availabilityText || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return null;
  }

  return (
    <div className="recruiter-availability">
      <span>Available Timings</span>

      <div className="availability-list">
        {lines.map((line, index) => (
          <span
            key={`${line}-${index}`}
            className="availability-chip"
          >
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}

function BookingModal({
  recruiter,
  onClose,
  onConfirm,
  submitting,
}) {
  const interviewTypes = DEFAULT_INTERVIEW_TYPES;

  const availabilityLines = String(
    recruiter?.availabilityText || ""
  )
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const handleSubmit = (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    const selectedInterviewType =
      String(
        formData.get("interview_type") || ""
      ).trim();

    const message =
      String(
        formData.get("message") || ""
      ).trim();

    console.log(
      "Selected interview type:",
      selectedInterviewType
    );

    if (!selectedInterviewType) {
      toast.error(
        "Please select an interview type."
      );
      return;
    }

    onConfirm({
      interviewType: selectedInterviewType,
      message,
    });
  };

  return (
    <div className="booking-modal-backdrop">
      <div
        className="glass-card booking-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
      >
        <div className="booking-modal-header">
          <div className="booking-recruiter-heading">
            <img
              src={recruiter.avatar}
              alt={recruiter.name}
              className="booking-avatar"
              onError={(event) => {
                event.currentTarget.src =
                  getAvatarUrl(
                    recruiter.name,
                    ""
                  );
              }}
            />

            <div>
              <h3 id="booking-modal-title">
                Request Interview with{" "}
                {recruiter.name}
              </h3>

              <p>
                {recruiter.designation}

                {recruiter.company
                  ? ` • ${recruiter.company}`
                  : ""}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="modal-close-button"
            disabled={submitting}
            aria-label="Close booking modal"
          >
            <FiX />
          </button>
        </div>

        <div className="booking-info-message">
          <FiCalendar />

          {/* <span>
            Select an interview type and send
            your request. The recruiter will
            schedule the date and time.
          </span> */}
        </div>

        <form
          onSubmit={handleSubmit}
          className="booking-form"
        >
          <div className="form-group">
            <label htmlFor="interview-type">
              Interview Type *
            </label>

            <select
              id="interview-type"
              name="interview_type"
              className="input-field"
              defaultValue=""
              required
              disabled={submitting}
            >
              <option value="" disabled>
                Select interview type
              </option>

              {interviewTypes.map((type) => (
                <option
                  key={type}
                  value={type}
                >
                  {type}
                </option>
              ))}
            </select>
          </div>

          {availabilityLines.length > 0 && (
            <div className="form-group">
              <label>
                Recruiter Availability
              </label>

              <div className="availability-list">
                {availabilityLines.map(
                  (line, index) => (
                    <span
                      key={`${line}-${index}`}
                      className="availability-chip"
                    >
                      {line}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="booking-message">
              Message to Recruiter
            </label>

            <textarea
              id="booking-message"
              name="message"
              placeholder="Tell the recruiter what you want to focus on."
              rows={4}
              className="input-field"
              disabled={submitting}
            />
          </div>

          <div className="booking-actions">
            <button
              type="submit"
              className="btn-primary booking-submit-button"
              disabled={submitting}
            >
              {submitting ? (
                <FiLoader className="spin-animation" />
              ) : (
                <FiCalendar />
              )}

              {submitting
                ? "Sending Request..."
                : "Send Interview Request"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RecruiterCard({
  recruiter,
  onBook,
}) {
  const websiteUrl = recruiter.company_website
    ? recruiter.company_website.startsWith(
        "http"
      )
      ? recruiter.company_website
      : `https://${recruiter.company_website}`
    : "";

  return (
    <article className="recruiter-card glass-card recruiter-card-enhanced">
      <div className="recruiter-card-header">
        <div className="recruiter-profile-main">
          <img
            src={recruiter.avatar}
            alt={recruiter.name}
            className="recruiter-avatar-large"
            onError={(event) => {
              event.currentTarget.src =
                getAvatarUrl(
                  recruiter.name,
                  ""
                );
            }}
          />

          <div className="recruiter-heading-content">
            <div className="recruiter-name-row">
              <h3>{recruiter.name}</h3>

              {recruiter.isVerified && (
                <FiCheckCircle
                  className="verified-icon"
                  title="Verified recruiter"
                />
              )}
            </div>

            <p className="recruiter-designation">
              {recruiter.designation}
            </p>

            <p className="recruiter-company">
              <FiBriefcase />
              {recruiter.company}
            </p>

            <p className="recruiter-location">
              <FiMapPin />
              {recruiter.location}
            </p>
          </div>
        </div>

        <span
          className={
            recruiter.isVerified
              ? "status-verified"
              : "status-pending"
          }
        >
          {recruiter.isVerified
            ? "Verified"
            : "Pending"}
        </span>
      </div>

      {recruiter.bio && (
        <p className="recruiter-bio">
          {recruiter.bio}
        </p>
      )}

      <div className="recruiter-details-grid">
        <div className="recruiter-detail">
          <span>Experience</span>

          <strong>
            {recruiter.experience_years} years
          </strong>
        </div>

        {recruiter.specialization && (
          <div className="recruiter-detail">
            <span>Specialization</span>

            <strong>
              {recruiter.specialization}
            </strong>
          </div>
        )}

        {recruiter.industry && (
          <div className="recruiter-detail">
            <span>Industry</span>

            <strong>
              {recruiter.industry}
            </strong>
          </div>
        )}

        {recruiter.company_size && (
          <div className="recruiter-detail">
            <span>Company Size</span>

            <strong>
              {recruiter.company_size}
            </strong>
          </div>
        )}
      </div>

      <AvailabilitySlots
        availabilityText={
          recruiter.availabilityText
        }
      />

      {recruiter.techStack.length > 0 && (
        <div className="recruiter-tags">
          {recruiter.techStack.map((tag) => (
            <span
              key={tag}
              className="badge-glass"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="recruiter-contact">
        {recruiter.email && (
          <a
            href={`mailto:${recruiter.email}`}
          >
            <FiGlobe />
            {recruiter.email}
          </a>
        )}

        {recruiter.phone && (
          <a
            href={`tel:${recruiter.phone}`}
          >
            <FiPhone />
            {recruiter.phone}
          </a>
        )}
      </div>

      {(websiteUrl ||
        recruiter.company_logo) && (
        <div className="recruiter-links">
          {websiteUrl && (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noreferrer"
            >
              <FiGlobe />
              Company Website
            </a>
          )}

          {recruiter.company_logo && (
            <span className="company-logo-label">
              <img
                src={recruiter.company_logo}
                alt={`${recruiter.company} logo`}
                onError={(event) => {
                  event.currentTarget.style.display =
                    "none";
                }}
              />
            </span>
          )}
        </div>
      )}

      <div className="recruiter-card-footer">
        <div className="verification-text">
          {recruiter.isVerified ? (
            <>
              <FiCheckCircle />
              Verified recruiter
            </>
          ) : (
            <>
              <FiAlertCircle />
              Verification pending
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => onBook(recruiter)}
          className="btn-primary book-button"
        >
          <FiCalendar />
          Request Interview
        </button>
      </div>
    </article>
  );
}

export default function FindRecruiters() {
  const [recruiters, setRecruiters] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedSort, setSelectedSort] =
    useState("top-rated");

  const [
    bookingRecruiter,
    setBookingRecruiter,
  ] = useState(null);

  const [submitting, setSubmitting] =
    useState(false);

  const fetchRecruiters = useCallback(
    async () => {
      setLoading(true);
      setError(null);

      try {
        if (
          !isSupabaseConfigured() ||
          !supabase
        ) {
          setRecruiters([]);
          setError(
            "Supabase is not configured."
          );
          return;
        }

        const rows =
          await recruiterService.getAllRecruiterProfiles();

        const mappedRows = Array.isArray(rows)
          ? rows.map(normalizeRecruiter)
          : [];

        setRecruiters(mappedRows);
      } catch (fetchError) {
        console.error(
          "Error loading recruiters:",
          fetchError
        );

        setRecruiters([]);

        setError(
          fetchError?.message ||
            "Failed to load recruiter profiles."
        );

        toast.error(
          "Could not fetch recruiter profiles."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchRecruiters();
  }, [fetchRecruiters]);

  const filteredRecruiters = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    return [...recruiters]
      .filter((recruiter) => {
        const values = [
          recruiter.name,
          recruiter.company,
          recruiter.designation,
          recruiter.location,
          recruiter.industry,
          recruiter.specialization,
          recruiter.bio,
          recruiter.email,
          recruiter.phone,
          recruiter.availabilityText,
          ...(recruiter.techStack || []),
        ];

        return (
          !query ||
          values.some((value) =>
            String(value || "")
              .toLowerCase()
              .includes(query)
          )
        );
      })
      .sort((first, second) => {
        if (
          selectedSort ===
          "most-experienced"
        ) {
          return (
            second.experience_years -
            first.experience_years
          );
        }

        if (selectedSort === "newest") {
          return (
            new Date(second.created_at || 0) -
            new Date(first.created_at || 0)
          );
        }

        if (selectedSort === "company") {
          return first.company.localeCompare(
            second.company
          );
        }

        if (selectedSort === "top-rated") {
          return (
            Number(second.isVerified) -
            Number(first.isVerified)
          );
        }

        return 0;
      });
  }, [
    recruiters,
    searchQuery,
    selectedSort,
  ]);

  const handleConfirmBooking = async ({
    interviewType,
    message,
  }) => {
    setSubmitting(true);

    try {
      if (!bookingRecruiter?.id) {
        throw new Error(
          "Recruiter information is missing."
        );
      }

      if (!bookingRecruiter?.user_id) {
        throw new Error(
          "Recruiter account information is missing."
        );
      }

      if (!interviewType) {
        throw new Error(
          "Interview type is missing."
        );
      }

      let studentId = null;
      let studentName = "Candidate";
      let studentEmail = "";

      if (
        isSupabaseConfigured() &&
        supabase
      ) {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        studentId = user?.id || null;

        studentName =
          user?.user_metadata?.full_name ||
          user?.user_metadata?.name ||
          user?.email?.split("@")[0] ||
          "Candidate";

        studentEmail = user?.email || "";
      }

      if (!studentId) {
        studentId =
          tokenStorage?.user?.id || null;

        studentName =
          tokenStorage?.user?.name ||
          studentName;

        studentEmail =
          tokenStorage?.user?.email ||
          studentEmail;
      }

      if (!studentId) {
        throw new Error(
          "You must be logged in to send an interview request."
        );
      }

      console.log(
        "Sending interview request:",
        {
          recruiterId: bookingRecruiter.id,
          recruiterUserId:
            bookingRecruiter.user_id,
          interviewType,
          message,
        }
      );

      await recruiterService.bookInterview({
        recruiter_id: bookingRecruiter.id,
        recruiter_user_id:
          bookingRecruiter.user_id,

        recruiter_email:
          bookingRecruiter.email || "",

        recruiter_name:
          bookingRecruiter.full_name ||
          bookingRecruiter.name ||
          "Recruiter",

        student_id: studentId,
        student_name: studentName,
        student_email: studentEmail,

        interview_type: interviewType,
        message: message || "",
      });

      toast.success(
        `Interview request sent to ${bookingRecruiter.name}. The recruiter will schedule the session.`
      );

      setBookingRecruiter(null);
    } catch (bookingError) {
      console.error(
        "Interview request failed:",
        bookingError
      );

      toast.error(
        bookingError?.message ||
          "Failed to send interview request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Find Recruiters for Mock Interviews">
      <div className="find-recruiters-page">
        <section className="glass-card recruiter-hero">
          <div>
            <span className="badge-ai">
              <HiSparkles />
              Recruiter Marketplace
            </span>

            <h2>
              Request Mock Interviews with
              Expert Recruiters
            </h2>

            <p>
              Find verified recruiters based on
              role, company, industry, experience,
              specialization, location, and
              availability. The recruiter will
              confirm the date and time.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchRecruiters}
            className="btn-secondary refresh-button"
            disabled={loading}
          >
            <FiRefreshCw
              className={
                loading
                  ? "spin-animation"
                  : ""
              }
            />

            Refresh Pool
          </button>
        </section>

        <section className="glass-card recruiter-filters">
          <div className="search-sort-row">
            <div className="search-wrapper">
              <FiSearch className="search-icon" />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search by name, company, role, industry, skill, or timing..."
                className="input-field search-input"
              />
            </div>

            <select
              value={selectedSort}
              onChange={(event) =>
                setSelectedSort(
                  event.target.value
                )
              }
              className="input-field sort-select"
            >
              <option value="top-rated">
                Verified First
              </option>

              <option value="most-experienced">
                Most Experienced
              </option>

              <option value="newest">
                Newest Added
              </option>

              <option value="company">
                Company Name
              </option>
            </select>
          </div>
        </section>

        {error && !loading && (
          <section className="glass-card error-card">
            <FiAlertCircle />

            <div>
              <strong>
                Unable to load recruiters
              </strong>

              <p>{error}</p>
            </div>

            <button
              type="button"
              onClick={fetchRecruiters}
              className="btn-secondary"
            >
              Try Again
            </button>
          </section>
        )}

        {loading ? (
          <div className="recruiters-grid">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : filteredRecruiters.length === 0 ? (
          <section className="glass-card empty-card">
            <FiUser />

            <h3>No Recruiters Found</h3>

            <p>
              Try clearing your search or
              selecting a different filter.
            </p>
          </section>
        ) : (
          <div className="recruiters-grid">
            {filteredRecruiters.map(
              (recruiter) => (
                <RecruiterCard
                  key={recruiter.id}
                  recruiter={recruiter}
                  onBook={setBookingRecruiter}
                />
              )
            )}
          </div>
        )}

        {bookingRecruiter && (
          <BookingModal
            key={bookingRecruiter.id}
            recruiter={bookingRecruiter}
            onClose={() => {
              if (!submitting) {
                setBookingRecruiter(null);
              }
            }}
            onConfirm={handleConfirmBooking}
            submitting={submitting}
          />
        )}
      </div>
    </DashboardLayout>
  );
}