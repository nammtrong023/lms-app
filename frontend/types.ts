export type Tokens = {
    access_token: string;
    token_type: string;
};

type Base = {
    id: number;
    created_at: Date;
    updated_at: Date;
};

export type User = {
    username: string;
    email: string;
} & Base;

export type Course = {
    title: string;
    description: string;
    image_url: string;
    price: number;
    is_published: boolean;
    user_id: number;
    owner: User;
    category_id: number;
    category: Category;
    chapters: Chapter[];
    progress?: number;
} & Base;

export type Category = {
    name: string;
} & Base;

export type Chapter = {
    title: string;
    description: string;
    video_url: string;
    position: number;
    is_published: boolean;
    is_free: boolean;
    course_id: number;
    user_progress?: UserProgress[];
} & Base;

export type UserProgress = {
    is_completed: boolean;
    owner: User;
    chapter_id: number;
} & Base;

export type Purchase = {
    owner: User;
    course: Course;
} & Base;

export type ChapterDashBoard = {
    chapter: Chapter;
    purchase: Purchase;
    course_price: number;
    user_progress: UserProgress;
    next_chapter: Chapter | null;
};

export type CourseWithProgress = {
    title: string;
    description: string;
    image_url: string;
    price: number;
    is_published: boolean;
    user_id: number;
    owner: User;
    category_id: number;
    category: Category | null;
    chapters: number[];
    progress?: number | null;
} & Base;

export type CourseDashBoard = {
    completed_courses: CourseWithProgress[];
    courses_in_progress: CourseWithProgress[];
};

export type PurChaseAnalytic = {
    name: string;
    total: number;
};

export type Analytic = {
    data: PurChaseAnalytic[];
    total_revenue: number;
    total_sales: number;
    course_price: number;
};
