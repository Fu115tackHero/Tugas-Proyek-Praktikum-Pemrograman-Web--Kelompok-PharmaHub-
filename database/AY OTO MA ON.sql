--
-- PostgreSQL database dump
--

\restrict B9vZlZDnO8HDTvbJR20ym3JsbvOmSWAAVjZ9o0S4SYwIBXEZdQBUhyZMZSM13CI

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

-- Started on 2025-11-30 17:17:03

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 277 (class 1255 OID 35808)
-- Name: check_low_stock(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.check_low_stock() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (NEW.stock < NEW.min_stock AND (OLD.stock IS NULL OR OLD.stock >= OLD.min_stock)) THEN
        -- Kirim notifikasi ke semua admin
        INSERT INTO notifications (user_id, type, title, message, related_product_id, icon_type)
        SELECT 
            user_id,
            'stock_alert',
            'Stok Produk Rendah',
            'Produk "' || NEW.name || '" stock tersisa ' || NEW.stock || ' unit.',
            NEW.product_id,
            'warning'
        FROM users 
        WHERE role IN ('admin', 'pharmacist');
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.check_low_stock() OWNER TO postgres;

--
-- TOC entry 276 (class 1255 OID 35806)
-- Name: create_order_notification(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.create_order_notification() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    notif_title TEXT;
    notif_message TEXT;
BEGIN
    IF (TG_OP = 'UPDATE' AND OLD.order_status != NEW.order_status) THEN
        CASE NEW.order_status
            WHEN 'confirmed' THEN
                notif_title := 'Pesanan Dikonfirmasi';
                notif_message := 'Pesanan ' || NEW.order_number || ' telah dikonfirmasi dan sedang disiapkan.';
            WHEN 'preparing' THEN
                notif_title := 'Pesanan Sedang Disiapkan';
                notif_message := 'Pesanan ' || NEW.order_number || ' sedang disiapkan oleh apoteker kami.';
            WHEN 'ready' THEN
                notif_title := 'Pesanan Siap Diambil';
                notif_message := 'Pesanan ' || NEW.order_number || ' sudah siap untuk diambil.';
            WHEN 'completed' THEN
                notif_title := 'Pesanan Selesai';
                notif_message := 'Pesanan ' || NEW.order_number || ' telah selesai. Terima kasih!';
            WHEN 'cancelled' THEN
                notif_title := 'Pesanan Dibatalkan';
                notif_message := 'Pesanan ' || NEW.order_number || ' telah dibatalkan.';
            ELSE
                RETURN NEW;
        END CASE;
        
        INSERT INTO notifications (user_id, type, title, message, related_order_id, order_status, customer_name, icon_type)
        VALUES (NEW.user_id, 'order', notif_title, notif_message, NEW.order_id, NEW.order_status, NEW.customer_name,
                CASE WHEN NEW.order_status = 'cancelled' THEN 'error' 
                     WHEN NEW.order_status = 'completed' THEN 'success' 
                     ELSE 'info' END);
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.create_order_notification() OWNER TO postgres;

--
-- TOC entry 263 (class 1255 OID 35803)
-- Name: generate_order_number(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.generate_order_number() RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    new_order_number TEXT;
    counter INTEGER;
BEGIN
    counter := (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURRENT_DATE) + 1;
    new_order_number := 'PHARMAHUB-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 5, '0');
    RETURN new_order_number;
END;
$$;


ALTER FUNCTION public.generate_order_number() OWNER TO postgres;

--
-- TOC entry 264 (class 1255 OID 35804)
-- Name: update_product_stock_after_order(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_product_stock_after_order() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE products 
        SET stock = stock - NEW.quantity,
            sold_count = sold_count + NEW.quantity
        WHERE product_id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_product_stock_after_order() OWNER TO postgres;

--
-- TOC entry 262 (class 1255 OID 35796)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 254 (class 1259 OID 35739)
-- Name: admin_activity_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_activity_logs (
    log_id integer NOT NULL,
    admin_id integer NOT NULL,
    action_type character varying(100) NOT NULL,
    target_type character varying(50),
    target_id integer,
    description text,
    old_values jsonb,
    new_values jsonb,
    ip_address character varying(45),
    user_agent text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admin_activity_logs OWNER TO postgres;

--
-- TOC entry 253 (class 1259 OID 35738)
-- Name: admin_activity_logs_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_activity_logs_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_activity_logs_log_id_seq OWNER TO postgres;

--
-- TOC entry 5314 (class 0 OID 0)
-- Dependencies: 253
-- Name: admin_activity_logs_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_activity_logs_log_id_seq OWNED BY public.admin_activity_logs.log_id;


--
-- TOC entry 242 (class 1259 OID 35576)
-- Name: orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orders (
    order_id integer NOT NULL,
    order_number character varying(50) NOT NULL,
    user_id integer NOT NULL,
    customer_name character varying(255) NOT NULL,
    customer_email character varying(255),
    customer_phone character varying(20) NOT NULL,
    customer_address text,
    subtotal numeric(12,2) NOT NULL,
    tax_amount numeric(12,2) DEFAULT 0,
    discount_amount numeric(12,2) DEFAULT 0,
    total_amount numeric(12,2) NOT NULL,
    coupon_code character varying(50),
    payment_method character varying(50) NOT NULL,
    payment_status character varying(50) DEFAULT 'pending'::character varying,
    prescription_image character varying(255),
    prescription_verified boolean DEFAULT false,
    order_status character varying(50) DEFAULT 'pending'::character varying NOT NULL,
    current_courier_id integer,
    estimated_ready_time timestamp without time zone,
    ready_at timestamp without time zone,
    completed_at timestamp without time zone,
    cancelled_at timestamp without time zone,
    notes text,
    cancellation_reason text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    payment_timestamp timestamp without time zone,
    CONSTRAINT check_order_status CHECK (((order_status)::text = ANY ((ARRAY['pending'::character varying, 'confirmed'::character varying, 'preparing'::character varying, 'ready'::character varying, 'completed'::character varying, 'cancelled'::character varying, 'delivered'::character varying])::text[]))),
    CONSTRAINT check_payment_method CHECK (((payment_method)::text = ANY ((ARRAY['pembayaran_online'::character varying, 'bayar_ditempat'::character varying])::text[]))),
    CONSTRAINT check_payment_status CHECK (((payment_status)::text = ANY ((ARRAY['pending'::character varying, 'paid'::character varying, 'failed'::character varying, 'refunded'::character varying, 'unpaid'::character varying])::text[]))),
    CONSTRAINT check_totals CHECK ((total_amount >= (0)::numeric))
);


ALTER TABLE public.orders OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 35396)
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    product_id integer NOT NULL,
    name character varying(255) NOT NULL,
    brand character varying(100),
    category_id integer,
    price numeric(12,2) NOT NULL,
    description text,
    stock integer DEFAULT 0,
    min_stock integer DEFAULT 10,
    prescription_required boolean DEFAULT false,
    main_image_url character varying(500),
    is_active boolean DEFAULT true,
    featured boolean DEFAULT false,
    view_count integer DEFAULT 0,
    sold_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_price CHECK ((price >= (0)::numeric)),
    CONSTRAINT check_stock CHECK ((stock >= 0))
);


ALTER TABLE public.products OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 35309)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    phone character varying(20),
    role character varying(20) DEFAULT 'customer'::character varying NOT NULL,
    profile_photo_url character varying(255),
    address text,
    last_known_latitude numeric(10,8),
    last_known_longitude numeric(11,8),
    last_location_update timestamp without time zone,
    is_active boolean DEFAULT true,
    email_verified boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_role CHECK (((role)::text = ANY ((ARRAY['customer'::character varying, 'admin'::character varying, 'pharmacist'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 257 (class 1259 OID 35781)
-- Name: admin_dashboard_stats; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.admin_dashboard_stats AS
 SELECT ( SELECT count(*) AS count
           FROM public.products
          WHERE (products.is_active = true)) AS total_active_products,
    ( SELECT count(*) AS count
           FROM public.products
          WHERE (products.stock < products.min_stock)) AS low_stock_products,
    ( SELECT count(*) AS count
           FROM public.orders
          WHERE (date(orders.created_at) = CURRENT_DATE)) AS today_orders,
    ( SELECT count(*) AS count
           FROM public.orders
          WHERE ((orders.order_status)::text = ANY ((ARRAY['pending'::character varying, 'confirmed'::character varying, 'preparing'::character varying])::text[]))) AS pending_orders,
    ( SELECT COALESCE(sum(orders.total_amount), (0)::numeric) AS "coalesce"
           FROM public.orders
          WHERE ((date(orders.created_at) = CURRENT_DATE) AND ((orders.order_status)::text = 'completed'::text))) AS today_revenue,
    ( SELECT COALESCE(sum(orders.total_amount), (0)::numeric) AS "coalesce"
           FROM public.orders
          WHERE ((date_trunc('month'::text, orders.created_at) = date_trunc('month'::text, (CURRENT_DATE)::timestamp with time zone)) AND ((orders.order_status)::text = 'completed'::text))) AS monthly_revenue,
    ( SELECT count(*) AS count
           FROM public.users
          WHERE ((users.role)::text = 'customer'::text)) AS total_customers,
    ( SELECT count(*) AS count
           FROM public.users
          WHERE (date(users.created_at) = CURRENT_DATE)) AS new_customers_today;


ALTER VIEW public.admin_dashboard_stats OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 35529)
-- Name: cart_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cart_items (
    cart_id integer NOT NULL,
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_quantity CHECK ((quantity > 0))
);


ALTER TABLE public.cart_items OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 35528)
-- Name: cart_items_cart_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cart_items_cart_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cart_items_cart_id_seq OWNER TO postgres;

--
-- TOC entry 5315 (class 0 OID 0)
-- Dependencies: 237
-- Name: cart_items_cart_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cart_items_cart_id_seq OWNED BY public.cart_items.cart_id;


--
-- TOC entry 261 (class 1259 OID 35813)
-- Name: coupon_usage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupon_usage (
    usage_id integer NOT NULL,
    coupon_id integer NOT NULL,
    user_id integer NOT NULL,
    order_id integer,
    discount_amount numeric(12,2) NOT NULL,
    used_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.coupon_usage OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 35812)
-- Name: coupon_usage_usage_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.coupon_usage_usage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.coupon_usage_usage_id_seq OWNER TO postgres;

--
-- TOC entry 5316 (class 0 OID 0)
-- Dependencies: 260
-- Name: coupon_usage_usage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.coupon_usage_usage_id_seq OWNED BY public.coupon_usage.usage_id;


--
-- TOC entry 236 (class 1259 OID 35491)
-- Name: coupons; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.coupons (
    coupon_id integer NOT NULL,
    code character varying(50) NOT NULL,
    description text,
    discount_type character varying(20) NOT NULL,
    discount_value numeric(12,2) NOT NULL,
    min_purchase numeric(12,2) DEFAULT 0,
    max_discount numeric(12,2),
    usage_limit integer,
    usage_per_user integer DEFAULT 1,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_discount_type CHECK (((discount_type)::text = ANY ((ARRAY['percentage'::character varying, 'fixed'::character varying])::text[]))),
    CONSTRAINT check_discount_value CHECK ((discount_value > (0)::numeric))
);


ALTER TABLE public.coupons OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 35490)
-- Name: coupons_coupon_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.coupons_coupon_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.coupons_coupon_id_seq OWNER TO postgres;

--
-- TOC entry 5317 (class 0 OID 0)
-- Dependencies: 235
-- Name: coupons_coupon_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.coupons_coupon_id_seq OWNED BY public.coupons.coupon_id;


--
-- TOC entry 252 (class 1259 OID 35717)
-- Name: notification_preferences; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notification_preferences (
    preference_id integer NOT NULL,
    user_id integer NOT NULL,
    email_order_updates boolean DEFAULT true,
    email_promotions boolean DEFAULT true,
    email_newsletters boolean DEFAULT false,
    push_order_updates boolean DEFAULT true,
    push_promotions boolean DEFAULT true,
    sms_order_updates boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notification_preferences OWNER TO postgres;

--
-- TOC entry 251 (class 1259 OID 35716)
-- Name: notification_preferences_preference_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notification_preferences_preference_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notification_preferences_preference_id_seq OWNER TO postgres;

--
-- TOC entry 5318 (class 0 OID 0)
-- Dependencies: 251
-- Name: notification_preferences_preference_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notification_preferences_preference_id_seq OWNED BY public.notification_preferences.preference_id;


--
-- TOC entry 250 (class 1259 OID 35681)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    notification_id integer NOT NULL,
    user_id integer NOT NULL,
    type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    related_order_id integer,
    related_product_id integer,
    related_coupon_id integer,
    order_status character varying(50),
    customer_name character varying(255),
    icon_type character varying(50),
    notification_image bytea,
    notification_image_mime_type character varying(50),
    is_read boolean DEFAULT false,
    read_at timestamp without time zone,
    action_url character varying(500),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp without time zone,
    CONSTRAINT check_notification_type CHECK (((type)::text = ANY ((ARRAY['order'::character varying, 'promotion'::character varying, 'system'::character varying, 'stock_alert'::character varying, 'review'::character varying, 'payment'::character varying, 'coupon'::character varying])::text[])))
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 249 (class 1259 OID 35680)
-- Name: notifications_notification_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_notification_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_notification_id_seq OWNER TO postgres;

--
-- TOC entry 5319 (class 0 OID 0)
-- Dependencies: 249
-- Name: notifications_notification_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_notification_id_seq OWNED BY public.notifications.notification_id;


--
-- TOC entry 248 (class 1259 OID 35657)
-- Name: order_delivery_tracking; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_delivery_tracking (
    tracking_id integer NOT NULL,
    order_id integer NOT NULL,
    customer_latitude numeric(10,8),
    customer_longitude numeric(11,8),
    pharmacy_id integer,
    is_tracking_enabled boolean DEFAULT false,
    last_update timestamp without time zone,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.order_delivery_tracking OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 35656)
-- Name: order_delivery_tracking_tracking_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_delivery_tracking_tracking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_delivery_tracking_tracking_id_seq OWNER TO postgres;

--
-- TOC entry 5320 (class 0 OID 0)
-- Dependencies: 247
-- Name: order_delivery_tracking_tracking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_delivery_tracking_tracking_id_seq OWNED BY public.order_delivery_tracking.tracking_id;


--
-- TOC entry 244 (class 1259 OID 35614)
-- Name: order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_items (
    order_item_id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    product_name character varying(255) NOT NULL,
    product_price numeric(12,2) NOT NULL,
    quantity integer NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    CONSTRAINT check_price_positive CHECK ((product_price >= (0)::numeric)),
    CONSTRAINT check_quantity_positive CHECK ((quantity > 0))
);


ALTER TABLE public.order_items OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 35613)
-- Name: order_items_order_item_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_items_order_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_order_item_id_seq OWNER TO postgres;

--
-- TOC entry 5321 (class 0 OID 0)
-- Dependencies: 243
-- Name: order_items_order_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_items_order_item_id_seq OWNED BY public.order_items.order_item_id;


--
-- TOC entry 246 (class 1259 OID 35635)
-- Name: order_status_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.order_status_history (
    history_id integer NOT NULL,
    order_id integer NOT NULL,
    old_status character varying(50),
    new_status character varying(50) NOT NULL,
    notes text,
    changed_by integer,
    changed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.order_status_history OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 35634)
-- Name: order_status_history_history_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.order_status_history_history_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_status_history_history_id_seq OWNER TO postgres;

--
-- TOC entry 5322 (class 0 OID 0)
-- Dependencies: 245
-- Name: order_status_history_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.order_status_history_history_id_seq OWNED BY public.order_status_history.history_id;


--
-- TOC entry 241 (class 1259 OID 35575)
-- Name: orders_order_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orders_order_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_order_id_seq OWNER TO postgres;

--
-- TOC entry 5323 (class 0 OID 0)
-- Dependencies: 241
-- Name: orders_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orders_order_id_seq OWNED BY public.orders.order_id;


--
-- TOC entry 224 (class 1259 OID 35358)
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    token_id integer NOT NULL,
    user_id integer NOT NULL,
    token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.password_reset_tokens OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 35357)
-- Name: password_reset_tokens_token_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_reset_tokens_token_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.password_reset_tokens_token_id_seq OWNER TO postgres;

--
-- TOC entry 5324 (class 0 OID 0)
-- Dependencies: 223
-- Name: password_reset_tokens_token_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_reset_tokens_token_id_seq OWNED BY public.password_reset_tokens.token_id;


--
-- TOC entry 220 (class 1259 OID 35328)
-- Name: pharmacy_info; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pharmacy_info (
    pharmacy_id integer NOT NULL,
    name character varying(255) DEFAULT 'PharmaHub'::character varying NOT NULL,
    address text NOT NULL,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    phone character varying(20),
    operating_hours text,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.pharmacy_info OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 35327)
-- Name: pharmacy_info_pharmacy_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pharmacy_info_pharmacy_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.pharmacy_info_pharmacy_id_seq OWNER TO postgres;

--
-- TOC entry 5325 (class 0 OID 0)
-- Dependencies: 219
-- Name: pharmacy_info_pharmacy_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pharmacy_info_pharmacy_id_seq OWNED BY public.pharmacy_info.pharmacy_id;


--
-- TOC entry 226 (class 1259 OID 35376)
-- Name: product_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_categories (
    category_id integer NOT NULL,
    category_name character varying(100) NOT NULL,
    description text,
    icon_image_url character varying(255),
    parent_category_id integer,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.product_categories OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 35375)
-- Name: product_categories_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_categories_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_categories_category_id_seq OWNER TO postgres;

--
-- TOC entry 5326 (class 0 OID 0)
-- Dependencies: 225
-- Name: product_categories_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_categories_category_id_seq OWNED BY public.product_categories.category_id;


--
-- TOC entry 232 (class 1259 OID 35445)
-- Name: product_details; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_details (
    detail_id integer NOT NULL,
    product_id integer NOT NULL,
    generic_name character varying(255),
    uses text,
    how_it_works text,
    important_info text[],
    ingredients text[],
    precaution text[],
    side_effects text[],
    interactions text[],
    indication text[],
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.product_details OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 35444)
-- Name: product_details_detail_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_details_detail_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_details_detail_id_seq OWNER TO postgres;

--
-- TOC entry 5327 (class 0 OID 0)
-- Dependencies: 231
-- Name: product_details_detail_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_details_detail_id_seq OWNED BY public.product_details.detail_id;


--
-- TOC entry 230 (class 1259 OID 35426)
-- Name: product_images; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_images (
    image_id integer NOT NULL,
    product_id integer NOT NULL,
    image_url character varying(500) NOT NULL,
    image_order integer DEFAULT 0,
    is_primary boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.product_images OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 35425)
-- Name: product_images_image_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_images_image_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_images_image_id_seq OWNER TO postgres;

--
-- TOC entry 5328 (class 0 OID 0)
-- Dependencies: 229
-- Name: product_images_image_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_images_image_id_seq OWNED BY public.product_images.image_id;


--
-- TOC entry 234 (class 1259 OID 35464)
-- Name: product_reviews; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.product_reviews (
    review_id integer NOT NULL,
    product_id integer NOT NULL,
    user_id integer NOT NULL,
    rating integer NOT NULL,
    comment text,
    review_images character varying(255)[],
    is_verified_purchase boolean DEFAULT false,
    helpful_count integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT product_reviews_rating_check CHECK (((rating >= 1) AND (rating <= 5)))
);


ALTER TABLE public.product_reviews OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 35463)
-- Name: product_reviews_review_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.product_reviews_review_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.product_reviews_review_id_seq OWNER TO postgres;

--
-- TOC entry 5329 (class 0 OID 0)
-- Dependencies: 233
-- Name: product_reviews_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.product_reviews_review_id_seq OWNED BY public.product_reviews.review_id;


--
-- TOC entry 227 (class 1259 OID 35395)
-- Name: products_product_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_product_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_product_id_seq OWNER TO postgres;

--
-- TOC entry 5330 (class 0 OID 0)
-- Dependencies: 227
-- Name: products_product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_product_id_seq OWNED BY public.products.product_id;


--
-- TOC entry 256 (class 1259 OID 35757)
-- Name: sales_reports; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sales_reports (
    report_id integer NOT NULL,
    report_date date NOT NULL,
    total_orders integer DEFAULT 0,
    completed_orders integer DEFAULT 0,
    cancelled_orders integer DEFAULT 0,
    total_revenue numeric(15,2) DEFAULT 0,
    total_tax numeric(15,2) DEFAULT 0,
    total_discount numeric(15,2) DEFAULT 0,
    net_revenue numeric(15,2) DEFAULT 0,
    top_selling_product_id integer,
    top_selling_quantity integer DEFAULT 0,
    generated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.sales_reports OWNER TO postgres;

--
-- TOC entry 255 (class 1259 OID 35756)
-- Name: sales_reports_report_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sales_reports_report_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sales_reports_report_id_seq OWNER TO postgres;

--
-- TOC entry 5331 (class 0 OID 0)
-- Dependencies: 255
-- Name: sales_reports_report_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sales_reports_report_id_seq OWNED BY public.sales_reports.report_id;


--
-- TOC entry 240 (class 1259 OID 35554)
-- Name: saved_for_later; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.saved_for_later (
    saved_id integer NOT NULL,
    user_id integer NOT NULL,
    product_id integer NOT NULL,
    saved_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.saved_for_later OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 35553)
-- Name: saved_for_later_saved_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.saved_for_later_saved_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.saved_for_later_saved_id_seq OWNER TO postgres;

--
-- TOC entry 5332 (class 0 OID 0)
-- Dependencies: 239
-- Name: saved_for_later_saved_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.saved_for_later_saved_id_seq OWNED BY public.saved_for_later.saved_id;


--
-- TOC entry 258 (class 1259 OID 35786)
-- Name: top_selling_products; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.top_selling_products AS
 SELECT p.product_id,
    p.name,
    p.brand,
    p.price,
    p.stock,
    p.sold_count,
    count(DISTINCT oi.order_id) AS total_orders,
    sum(oi.quantity) AS total_quantity_sold,
    sum(oi.subtotal) AS total_revenue
   FROM ((public.products p
     LEFT JOIN public.order_items oi ON ((p.product_id = oi.product_id)))
     LEFT JOIN public.orders o ON (((oi.order_id = o.order_id) AND ((o.order_status)::text = 'completed'::text))))
  WHERE (p.is_active = true)
  GROUP BY p.product_id, p.name, p.brand, p.price, p.stock, p.sold_count
  ORDER BY (sum(oi.quantity)) DESC NULLS LAST;


ALTER VIEW public.top_selling_products OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 35341)
-- Name: user_addresses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_addresses (
    address_id integer NOT NULL,
    user_id integer NOT NULL,
    full_address text NOT NULL,
    google_place_id character varying(255),
    latitude numeric(10,8),
    longitude numeric(11,8),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.user_addresses OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 35340)
-- Name: user_addresses_address_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_addresses_address_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_addresses_address_id_seq OWNER TO postgres;

--
-- TOC entry 5333 (class 0 OID 0)
-- Dependencies: 221
-- Name: user_addresses_address_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_addresses_address_id_seq OWNED BY public.user_addresses.address_id;


--
-- TOC entry 259 (class 1259 OID 35791)
-- Name: user_order_history; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.user_order_history AS
 SELECT o.order_id,
    o.order_number,
    o.user_id,
    o.customer_name,
    o.customer_phone,
    o.total_amount,
    o.order_status,
    o.payment_status,
    o.payment_method,
    o.created_at,
    o.completed_at,
    count(oi.order_item_id) AS total_items,
    sum(oi.quantity) AS total_quantity
   FROM (public.orders o
     LEFT JOIN public.order_items oi ON ((o.order_id = oi.order_id)))
  GROUP BY o.order_id, o.order_number, o.user_id, o.customer_name, o.customer_phone, o.total_amount, o.order_status, o.payment_status, o.payment_method, o.created_at, o.completed_at
  ORDER BY o.created_at DESC;


ALTER VIEW public.user_order_history OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 35308)
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- TOC entry 5334 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- TOC entry 4939 (class 2604 OID 35742)
-- Name: admin_activity_logs log_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_activity_logs ALTER COLUMN log_id SET DEFAULT nextval('public.admin_activity_logs_log_id_seq'::regclass);


--
-- TOC entry 4907 (class 2604 OID 35532)
-- Name: cart_items cart_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items ALTER COLUMN cart_id SET DEFAULT nextval('public.cart_items_cart_id_seq'::regclass);


--
-- TOC entry 4952 (class 2604 OID 35816)
-- Name: coupon_usage usage_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usage ALTER COLUMN usage_id SET DEFAULT nextval('public.coupon_usage_usage_id_seq'::regclass);


--
-- TOC entry 4902 (class 2604 OID 35494)
-- Name: coupons coupon_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons ALTER COLUMN coupon_id SET DEFAULT nextval('public.coupons_coupon_id_seq'::regclass);


--
-- TOC entry 4931 (class 2604 OID 35720)
-- Name: notification_preferences preference_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preferences ALTER COLUMN preference_id SET DEFAULT nextval('public.notification_preferences_preference_id_seq'::regclass);


--
-- TOC entry 4928 (class 2604 OID 35684)
-- Name: notifications notification_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN notification_id SET DEFAULT nextval('public.notifications_notification_id_seq'::regclass);


--
-- TOC entry 4924 (class 2604 OID 35660)
-- Name: order_delivery_tracking tracking_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_delivery_tracking ALTER COLUMN tracking_id SET DEFAULT nextval('public.order_delivery_tracking_tracking_id_seq'::regclass);


--
-- TOC entry 4921 (class 2604 OID 35617)
-- Name: order_items order_item_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items ALTER COLUMN order_item_id SET DEFAULT nextval('public.order_items_order_item_id_seq'::regclass);


--
-- TOC entry 4922 (class 2604 OID 35638)
-- Name: order_status_history history_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history ALTER COLUMN history_id SET DEFAULT nextval('public.order_status_history_history_id_seq'::regclass);


--
-- TOC entry 4913 (class 2604 OID 35579)
-- Name: orders order_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders ALTER COLUMN order_id SET DEFAULT nextval('public.orders_order_id_seq'::regclass);


--
-- TOC entry 4873 (class 2604 OID 35361)
-- Name: password_reset_tokens token_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN token_id SET DEFAULT nextval('public.password_reset_tokens_token_id_seq'::regclass);


--
-- TOC entry 4865 (class 2604 OID 35331)
-- Name: pharmacy_info pharmacy_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_info ALTER COLUMN pharmacy_id SET DEFAULT nextval('public.pharmacy_info_pharmacy_id_seq'::regclass);


--
-- TOC entry 4876 (class 2604 OID 35379)
-- Name: product_categories category_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories ALTER COLUMN category_id SET DEFAULT nextval('public.product_categories_category_id_seq'::regclass);


--
-- TOC entry 4894 (class 2604 OID 35448)
-- Name: product_details detail_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_details ALTER COLUMN detail_id SET DEFAULT nextval('public.product_details_detail_id_seq'::regclass);


--
-- TOC entry 4890 (class 2604 OID 35429)
-- Name: product_images image_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images ALTER COLUMN image_id SET DEFAULT nextval('public.product_images_image_id_seq'::regclass);


--
-- TOC entry 4897 (class 2604 OID 35467)
-- Name: product_reviews review_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_reviews ALTER COLUMN review_id SET DEFAULT nextval('public.product_reviews_review_id_seq'::regclass);


--
-- TOC entry 4880 (class 2604 OID 35399)
-- Name: products product_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN product_id SET DEFAULT nextval('public.products_product_id_seq'::regclass);


--
-- TOC entry 4941 (class 2604 OID 35760)
-- Name: sales_reports report_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_reports ALTER COLUMN report_id SET DEFAULT nextval('public.sales_reports_report_id_seq'::regclass);


--
-- TOC entry 4911 (class 2604 OID 35557)
-- Name: saved_for_later saved_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_for_later ALTER COLUMN saved_id SET DEFAULT nextval('public.saved_for_later_saved_id_seq'::regclass);


--
-- TOC entry 4870 (class 2604 OID 35344)
-- Name: user_addresses address_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_addresses ALTER COLUMN address_id SET DEFAULT nextval('public.user_addresses_address_id_seq'::regclass);


--
-- TOC entry 4859 (class 2604 OID 35312)
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- TOC entry 5304 (class 0 OID 35739)
-- Dependencies: 254
-- Data for Name: admin_activity_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_activity_logs (log_id, admin_id, action_type, target_type, target_id, description, old_values, new_values, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- TOC entry 5288 (class 0 OID 35529)
-- Dependencies: 238
-- Data for Name: cart_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cart_items (cart_id, user_id, product_id, quantity, added_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5308 (class 0 OID 35813)
-- Dependencies: 261
-- Data for Name: coupon_usage; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupon_usage (usage_id, coupon_id, user_id, order_id, discount_amount, used_at) FROM stdin;
\.


--
-- TOC entry 5286 (class 0 OID 35491)
-- Dependencies: 236
-- Data for Name: coupons; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.coupons (coupon_id, code, description, discount_type, discount_value, min_purchase, max_discount, usage_limit, usage_per_user, start_date, end_date, is_active, created_at) FROM stdin;
1	SEHAT10	Diskon 10% untuk semua produk	percentage	10.00	0.00	\N	\N	5	2025-01-01 00:00:00	2025-12-31 00:00:00	t	2025-11-30 16:01:00.880759
2	SEHAT50K	Diskon Rp 50.000 untuk pembelian minimal Rp 200.000	fixed	50000.00	200000.00	\N	100	3	2025-01-01 00:00:00	2025-12-31 00:00:00	t	2025-11-30 16:01:00.880759
3	NEWUSER	Diskon 15% untuk pengguna baru	percentage	15.00	50000.00	100000.00	500	1	2025-01-01 00:00:00	2025-12-31 00:00:00	t	2025-11-30 16:01:00.880759
4	GRATIS20K	Gratis Rp 20.000 untuk pembelian minimal Rp 100.000	fixed	20000.00	100000.00	\N	200	2	2025-01-01 00:00:00	2025-12-31 00:00:00	t	2025-11-30 16:01:00.880759
\.


--
-- TOC entry 5302 (class 0 OID 35717)
-- Dependencies: 252
-- Data for Name: notification_preferences; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notification_preferences (preference_id, user_id, email_order_updates, email_promotions, email_newsletters, push_order_updates, push_promotions, sms_order_updates, updated_at) FROM stdin;
\.


--
-- TOC entry 5300 (class 0 OID 35681)
-- Dependencies: 250
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (notification_id, user_id, type, title, message, related_order_id, related_product_id, related_coupon_id, order_status, customer_name, icon_type, notification_image, notification_image_mime_type, is_read, read_at, action_url, created_at, expires_at) FROM stdin;
\.


--
-- TOC entry 5298 (class 0 OID 35657)
-- Dependencies: 248
-- Data for Name: order_delivery_tracking; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_delivery_tracking (tracking_id, order_id, customer_latitude, customer_longitude, pharmacy_id, is_tracking_enabled, last_update, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5294 (class 0 OID 35614)
-- Dependencies: 244
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_items (order_item_id, order_id, product_id, product_name, product_price, quantity, subtotal) FROM stdin;
\.


--
-- TOC entry 5296 (class 0 OID 35635)
-- Dependencies: 246
-- Data for Name: order_status_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.order_status_history (history_id, order_id, old_status, new_status, notes, changed_by, changed_at) FROM stdin;
\.


--
-- TOC entry 5292 (class 0 OID 35576)
-- Dependencies: 242
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orders (order_id, order_number, user_id, customer_name, customer_email, customer_phone, customer_address, subtotal, tax_amount, discount_amount, total_amount, coupon_code, payment_method, payment_status, prescription_image, prescription_verified, order_status, current_courier_id, estimated_ready_time, ready_at, completed_at, cancelled_at, notes, cancellation_reason, created_at, updated_at, payment_timestamp) FROM stdin;
\.


--
-- TOC entry 5274 (class 0 OID 35358)
-- Dependencies: 224
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (token_id, user_id, token, expires_at, used, created_at) FROM stdin;
\.


--
-- TOC entry 5270 (class 0 OID 35328)
-- Dependencies: 220
-- Data for Name: pharmacy_info; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pharmacy_info (pharmacy_id, name, address, latitude, longitude, phone, operating_hours, is_active, created_at, updated_at) FROM stdin;
1	PharmaHub	Gedung C Fasilkom-TI, Universitas Sumatera Utara, Jl. Alumni No.3, Padang Bulan, Kec. Medan Baru, Kota Medan, Sumatera Utara 20155	3.19570000	101.63250000	081234567890	09:00-21:00	t	2025-11-30 13:45:28.640394	2025-11-30 13:45:28.640394
\.


--
-- TOC entry 5276 (class 0 OID 35376)
-- Dependencies: 226
-- Data for Name: product_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_categories (category_id, category_name, description, icon_image_url, parent_category_id, is_active, created_at, updated_at) FROM stdin;
1	Obat Nyeri & Demam	Kategori untuk obat nyeri & demam	\N	\N	t	2025-11-30 13:47:04.914296	2025-11-30 13:47:04.914296
2	Obat Pencernaan	Kategori untuk obat pencernaan	\N	\N	t	2025-11-30 13:47:04.914296	2025-11-30 13:47:04.914296
3	Obat Alergi	Kategori untuk obat alergi	\N	\N	t	2025-11-30 13:47:04.914296	2025-11-30 13:47:04.914296
4	Obat Pernapasan	Kategori untuk obat pernapasan	\N	\N	t	2025-11-30 13:47:04.914296	2025-11-30 13:47:04.914296
5	Antiseptik	Kategori untuk antiseptik	\N	\N	t	2025-11-30 13:47:04.914296	2025-11-30 13:47:04.914296
6	Vitamin & Suplemen	Kategori untuk vitamin & suplemen	\N	\N	t	2025-11-30 13:47:04.914296	2025-11-30 13:47:04.914296
7	Antibiotik	Kategori untuk antibiotik	\N	\N	t	2025-11-30 13:47:04.914296	2025-11-30 13:47:04.914296
8	Obat Jantung & Hipertensi	Kategori untuk obat jantung & hipertensi	\N	\N	t	2025-11-30 13:47:04.914296	2025-11-30 13:47:04.914296
16	Obat Diabetes	Obat Diabetes products	\N	\N	t	2025-11-30 13:47:46.746144	2025-11-30 13:47:46.746144
18	Obat Luar	Obat Luar products	\N	\N	t	2025-11-30 13:47:46.752428	2025-11-30 13:47:46.752428
39	BRUHING	Kategori untuk bruhing	\N	\N	t	2025-11-30 14:42:34.617047	2025-11-30 14:42:34.617047
40	lion	Kategori untuk lion	\N	\N	t	2025-11-30 15:23:28.201178	2025-11-30 15:23:28.201178
\.


--
-- TOC entry 5282 (class 0 OID 35445)
-- Dependencies: 232
-- Data for Name: product_details; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_details (detail_id, product_id, generic_name, uses, how_it_works, important_info, ingredients, precaution, side_effects, interactions, indication, created_at, updated_at) FROM stdin;
22	7	Povidone Iodine	Antiseptik untuk luka kecil, goresan, dan pencegahan infeksi pada luka luar.	\N	\N	{"Povidone iodine 10%",Nonoxynol-9,"Sodium phosphate","Citric acid","Sodium hydroxide","Purified water"}	{"Hanya untuk penggunaan luar","Hindari kontak dengan mata","Jangan gunakan pada luka yang luas atau dalam"}	{"Iritasi kulit ringan pada penggunaan pertama","Reaksi alergi pada orang sensitif terhadap iodine","Perubahan warna kulit sementara"}	{"Hidrogen peroksida: dapat mengurangi efektivitas","Obat topikal lain: hindari penggunaan bersamaan","Silver sulfadiazine: dapat bereaksi dan mengurangi efektivitas"}	{"Luka kecil dan goresan","Antiseptik sebelum injeksi","Pembersihan kulit sebelum operasi kecil","Pencegahan infeksi pada luka minor"}	2025-11-30 14:17:43.925064	2025-11-30 14:36:01.252756
23	8	Oralit	Mengganti cairan dan elektrolit yang hilang akibat diare, muntah, atau berkeringat berlebihan.	\N	\N	{"Sodium chloride 2.6 g","Potassium chloride 1.5 g","Glucose anhydrous 13.5 g","Trisodium citrate dihydrate 2.9 g","Zinc sulfate 0.03 g (per sachet)"}	{"Larutkan dalam air matang dingin","Habiskan dalam 24 jam setelah dilarutkan","Konsultasikan dokter jika dehidrasi berat"}	{"Mual jika diminum terlalu cepat","Muntah pada kasus dehidrasi berat","Rasa tidak enak di mulut (normal)"}	{"Tidak ada interaksi obat yang signifikan","Aman dikombinasikan dengan obat diare","Dapat diberikan bersama antibiotik jika diperlukan"}	{"Dehidrasi ringan hingga sedang","Diare akut pada anak dan dewasa",Muntah-muntah,"Kehilangan cairan akibat berkeringat berlebihan"}	2025-11-30 14:17:44.226847	2025-11-30 14:36:01.258315
25	10	Amoxicillin	Mengobati infeksi bakteri pada saluran pernapasan, kulit, dan saluran kemih.	\N	\N	{"Amoxicillin trihydrate 500 mg","Mikrokristalin selulosa","Natrium starch glikolat",Polivinilpirolidon,"Magnesium stearat","Silika koloid",Hypromellose}	{"WAJIB dengan resep dokter","Habiskan antibiotik sesuai durasi yang diresepkan","Jangan gunakan jika alergi penisilin"}	{"Diare ringan","Mual dan muntah","Ruam kulit (reaksi alergi)"}	{"Probenecid: dapat meningkatkan kadar amoxicillin","Warfarin: dapat meningkatkan efek antikoagulan","Pil KB: dapat mengurangi efektivitas kontrasepsi"}	{"Infeksi saluran pernapasan","Infeksi kulit dan jaringan lunak","Infeksi saluran kemih","Otitis media"}	2025-11-30 14:17:44.743764	2025-11-30 14:36:01.266192
26	11	Omeprazole	Mengurangi produksi asam lambung, mengobati tukak lambung dan GERD.	\N	\N	{"Omeprazole 20 mg","Laktosa monohidrat","Natrium bikarbonat","Natrium lauril sulfat",Krospovidon,Hypromellose,"Magnesium stearat"}	{"WAJIB dengan resep dokter","Konsumsi 30 menit sebelum makan","Hindari penggunaan jangka panjang tanpa pengawasan dokter"}	{"Sakit kepala","Diare atau konstipasi","Mual ringan"}	{"Warfarin: dapat meningkatkan risiko perdarahan","Clopidogrel: dapat mengurangi efektivitas clopidogrel","Ketoconazole: dapat mengurangi penyerapan ketoconazole"}	{"Tukak lambung dan duodenum","GERD (Gastroesophageal Reflux Disease)","Sindrom Zollinger-Ellison","Eradikasi H. pylori"}	2025-11-30 14:17:45.013896	2025-11-30 14:36:01.270017
27	12	Vitamin D3	Mendukung kesehatan tulang, gigi, dan sistem imun.	\N	\N	{"Vitamin C (Ascorbic acid) 500 mg","Mikrokristalin selulosa","Croscarmellose sodium",Hypromellose,"Magnesium stearat","Silika koloid","Titanium dioxide"}	{"Konsumsi bersama makanan berlemak untuk penyerapan optimal","Pantau kadar vitamin D dalam darah secara berkala","Hindari overdosis vitamin D"}	{"Mual jika overdosis","Konstipasi pada dosis tinggi","Hiperkalsemia jika dikonsumsi berlebihan"}	{"Thiazide diuretics: dapat meningkatkan risiko hiperkalsemia","Digoxin: peningkatan kalsium dapat meningkatkan toksisitas digoxin","Suplemen kalsium: dapat meningkatkan penyerapan kalsium"}	{"Defisiensi vitamin D","Osteoporosis dan osteomalacia","Rakhitis pada anak",Hipoparatiroidisme}	2025-11-30 14:17:45.424561	2025-11-30 14:36:01.273817
28	13	Multivitamin	Memenuhi kebutuhan vitamin dan mineral harian untuk menjaga kesehatan tubuh.	\N	\N	{"Vitamin A 5000 IU","Vitamin C 60 mg","Vitamin D3 400 IU","Vitamin E 30 IU","Vitamin B1 1.5 mg","Vitamin B2 1.7 mg","Vitamin B6 2 mg","Vitamin B12 6 mcg","Niacin 20 mg","Folic acid 400 mcg","Biotin 30 mcg","Pantothenic acid 10 mg","Calcium 162 mg","Iron 18 mg","Magnesium 100 mg","Zinc 15 mg","Selenium 20 mcg"}	{"Konsumsi setelah makan","Jangan melebihi dosis yang dianjurkan","Simpan di tempat sejuk dan kering"}	{"Mual jika dikonsumsi saat perut kosong","Perubahan warna urin (normal)","Gangguan pencernaan ringan"}	{"Antibiotik: dapat mengurangi penyerapan beberapa antibiotik","Warfarin: vitamin K dapat mempengaruhi efek antikoagulan","Levothyroxine: dapat mengurangi penyerapan hormon tiroid"}	{"Defisiensi vitamin dan mineral",Malnutrisi,"Periode pemulihan setelah sakit","Kebutuhan nutrisi meningkat"}	2025-11-30 14:17:46.737646	2025-11-30 14:36:01.277568
29	14	Alcohol	Membersihkan tangan, sterilisasi alat, dan desinfeksi permukaan.	\N	\N	{"Ethyl alcohol 70%","Carbomer 940",Triethanolamine,"Tocopheryl acetate (Vitamin E)","Aloe vera extract","Purified water"}	{"Hanya untuk penggunaan luar","Hindari kontak dengan mata","Jauhkan dari api dan sumber panas"}	{"Kulit kering dengan penggunaan berlebihan","Iritasi pada kulit sensitif","Dermatitis kontak pada penggunaan berulang"}	{"Tidak ada interaksi obat yang signifikan","Dapat merusak beberapa jenis plastik","Dapat mengurangi efektivitas hand sanitizer berbasis alkohol lain"}	{"Antiseptik tangan","Sterilisasi alat medis","Desinfeksi permukaan","Pembersihan sebelum injeksi"}	2025-11-30 14:17:47.0071	2025-11-30 14:36:01.281267
16	1	Paracetamol	Menurunkan demam, meredakan nyeri ringan hingga sedang seperti sakit kepala, sakit gigi, nyeri otot.	\N	\N	{"Paracetamol 500 mg","Mikrokristalin selulosa","Natrium starch glikolat",Polivinilpirolidon,"Magnesium stearat",Talk}	{"Jangan melebihi dosis yang dianjurkan (maksimal 4 gram per hari untuk dewasa)","Konsultasikan dengan dokter jika memiliki riwayat penyakit hati","Hindari konsumsi alkohol selama pengobatan"}	{"Jarang terjadi efek samping jika digunakan sesuai dosis","Reaksi alergi kulit (ruam, gatal) pada beberapa orang","Gangguan hati jika dikonsumsi berlebihan"}	{"Warfarin: dapat meningkatkan risiko perdarahan","Obat epilepsi: dapat mengurangi efektivitas paracetamol","Alkohol: meningkatkan risiko kerusakan hati"}	{"Demam pada anak dan dewasa","Sakit kepala ringan hingga sedang","Nyeri otot dan sendi ringan","Sakit gigi"}	2025-11-30 14:17:41.289996	2025-11-30 14:36:01.225683
17	2	Ibuprofen	Mengurangi peradangan, menurunkan demam, meredakan nyeri otot dan sendi.	\N	\N	{"Ibuprofen 400 mg","Laktosa monohidrat","Pati jagung","Natrium kroskarmelosa","Silika koloid anhidrat","Magnesium stearat",Hypromellose}	{"Konsumsi bersama makanan untuk mengurangi iritasi lambung","Hindari jika memiliki riwayat tukak lambung","Hati-hati pada penderita hipertensi dan penyakit jantung"}	{"Gangguan pencernaan (mual, nyeri perut)","Pusing dan sakit kepala","Ruam kulit pada beberapa kasus"}	{"Aspirin: meningkatkan risiko perdarahan","ACE inhibitor: dapat mengurangi efek penurun tekanan darah","Lithium: dapat meningkatkan kadar lithium dalam darah"}	{"Nyeri dan peradangan pada arthritis","Nyeri otot dan keseleo","Sakit gigi dan nyeri pascaoperasi",Demam}	2025-11-30 14:17:42.324603	2025-11-30 14:36:01.230103
18	3	Antasida	Meredakan sakit maag, nyeri ulu hati, kembung, dan mual akibat asam lambung berlebih.	\N	\N	{"Aluminum hydroxide 200 mg","Magnesium hydroxide 200 mg","Simethicone 25 mg",Sorbitol,Sukrosa,"Natrium siklamat","Peppermint oil"}	{"Konsumsi 1-2 jam setelah makan atau saat gejala muncul","Hindari konsumsi bersamaan dengan obat lain (jarak minimal 2 jam)","Konsultasikan dengan dokter jika gejala berlanjut lebih dari 2 minggu"}	{"Konstipasi atau diare ringan","Mual pada beberapa kasus","Perubahan warna feses menjadi kehitaman (normal)"}	{"Antibiotik: dapat mengurangi penyerapan antibiotik","Digoxin: dapat mengurangi efektivitas digoxin","Obat tiroid: dapat mengganggu penyerapan hormon tiroid"}	{"Gastritis dan sakit maag","Nyeri ulu hati (heartburn)","Kembung dan begah","Gangguan pencernaan akibat asam lambung"}	2025-11-30 14:17:42.63575	2025-11-30 14:36:01.234551
19	4	Loperamide	Mengatasi diare akut dengan mengurangi pergerakan usus dan meningkatkan penyerapan air.	\N	\N	{"Loperamide hydrochloride 2 mg","Laktosa monohidrat","Pati jagung",Polivinilpirolidon,"Magnesium stearat","Silika koloid"}	{"Jangan gunakan jika diare disertai demam tinggi atau darah","Hentikan penggunaan jika gejala memburuk setelah 2 hari","Perbanyak minum air untuk mencegah dehidrasi"}	{"Konstipasi jika digunakan berlebihan","Pusing dan mengantuk","Mual dan kembung ringan"}	{"Antibiotik: hindari penggunaan bersamaan tanpa konsultasi dokter","Opioid: dapat meningkatkan efek sedasi","Quinidine: dapat meningkatkan konsentrasi loperamide"}	{"Diare akut non-spesifik","Diare wisatawan","Diare kronik (dengan pengawasan dokter)","Mengurangi output ileostomi"}	2025-11-30 14:17:42.873635	2025-11-30 14:36:01.239818
20	5	Cetirizine	Meredakan gejala alergi seperti bersin, hidung tersumbat, mata berair, dan gatal-gatal.	\N	\N	{"Cetirizine dihydrochloride 10 mg","Mikrokristalin selulosa","Laktosa monohidrat","Natrium starch glikolat","Magnesium stearat",Hypromellose,"Titanium dioxide"}	{"Dapat menyebabkan kantuk pada beberapa orang","Hindari mengemudi atau mengoperasikan mesin berat","Kurangi dosis pada penderita gangguan ginjal"}	{"Kantuk ringan (lebih jarang daripada antihistamin generasi pertama)","Mulut kering","Sakit kepala ringan"}	{"Alkohol: dapat meningkatkan efek sedasi","Teofilin: dapat mengurangi clearance cetirizine","Ritonavir: dapat meningkatkan konsentrasi cetirizine"}	{"Rhinitis alergi musiman dan tahunan","Urtikaria kronik","Dermatitis atopik","Alergi makanan ringan"}	2025-11-30 14:17:43.282558	2025-11-30 14:36:01.244638
21	6	Salbutamol	Meredakan sesak napas, bronkospasme, dan gejala asma akut.	\N	\N	{"Salbutamol sulfate 100 mcg per actuation","HFA-134a propellant",Ethanol,"Oleic acid"}	{"Kocok inhaler sebelum digunakan","Bilas mulut setelah penggunaan","Jangan melebihi dosis yang dianjurkan"}	{"Tremor ringan pada tangan","Jantung berdebar","Sakit kepala ringan"}	{"Beta-blocker: dapat mengurangi efektivitas salbutamol","Diuretik: dapat meningkatkan risiko hipokalemia","Antidepresan trisiklik: dapat meningkatkan efek kardiovaskular"}	{"Asma bronkial","Penyakit paru obstruktif kronik (PPOK)","Bronkospasme akut","Pencegahan asma akibat aktivitas"}	2025-11-30 14:17:43.65923	2025-11-30 14:36:01.248413
24	9	Vitamin C	Meningkatkan sistem imun, membantu penyembuhan luka, dan melindungi dari radikal bebas.	\N	\N	{"Cholecalciferol (Vitamin D3) 1000 IU","Mikrokristalin selulosa","Laktosa monohidrat","Croscarmellose sodium","Magnesium stearat","Gelatin (kapsul)","Minyak kelapa sawit"}	{"Konsumsi setelah makan untuk mengurangi iritasi lambung","Jangan melebihi dosis yang dianjurkan","Konsultasikan dengan dokter jika sedang hamil atau menyusui"}	{"Gangguan pencernaan ringan pada dosis tinggi","Diare jika dikonsumsi berlebihan","Batu ginjal pada konsumsi jangka panjang dosis tinggi"}	{"Warfarin: dapat meningkatkan efek antikoagulan","Aspirin: dapat mengurangi penyerapan vitamin C","Suplemen zat besi: dapat meningkatkan penyerapan zat besi"}	{"Defisiensi vitamin C","Meningkatkan daya tahan tubuh","Membantu penyembuhan luka","Pencegahan sariawan"}	2025-11-30 14:17:44.482302	2025-11-30 14:36:01.26193
30	15	Captopril	Mengontrol tekanan darah tinggi dan mencegah komplikasi jantung.	\N	\N	{"Captopril 25 mg","Mikrokristalin selulosa","Laktosa monohidrat","Croscarmellose sodium","Magnesium stearat",Hypromellose}	{"WAJIB dengan resep dokter","Monitor tekanan darah secara teratur","Konsumsi 1 jam sebelum makan"}	{"Batuk kering","Hipotensi (tekanan darah rendah)","Peningkatan kadar kalium"}	{"Diuretik: dapat meningkatkan efek penurun tekanan darah","Suplemen kalium: dapat menyebabkan hiperkalemia","NSAIDs: dapat mengurangi efek antihipertensi"}	{"Hipertensi (tekanan darah tinggi)","Gagal jantung","Nefropati diabetik","Pasca infark miokard"}	2025-11-30 14:17:47.332674	2025-11-30 14:36:01.285548
\.


--
-- TOC entry 5280 (class 0 OID 35426)
-- Dependencies: 230
-- Data for Name: product_images; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_images (image_id, product_id, image_url, image_order, is_primary, created_at) FROM stdin;
\.


--
-- TOC entry 5284 (class 0 OID 35464)
-- Dependencies: 234
-- Data for Name: product_reviews; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.product_reviews (review_id, product_id, user_id, rating, comment, review_images, is_verified_purchase, helpful_count, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5278 (class 0 OID 35396)
-- Dependencies: 228
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (product_id, name, brand, category_id, price, description, stock, min_stock, prescription_required, main_image_url, is_active, featured, view_count, sold_count, created_at, updated_at) FROM stdin;
1	Paracetamol 500mg	Sanbe Farma	1	12000.00	Untuk menurunkan demam dan meredakan sakit kepala atau nyeri ringan.	100	10	f	https://vhmggapaspvvtglkijyq.supabase.co/storage/v1/object/public/product-images/1764487060137_csp3ggs.jpg	t	f	0	0	2025-11-30 14:17:41.283646	2025-11-30 14:36:01.168233
2	Ibuprofen 400mg	Kimia Farma	1	15000.00	Obat antiinflamasi non-steroid untuk nyeri otot, sendi, atau sakit gigi.	75	10	f	https://vhmggapaspvvtglkijyq.supabase.co/storage/v1/object/public/product-images/1764487061293_w0ojyiv.jpg	t	f	0	0	2025-11-30 14:17:42.322407	2025-11-30 14:36:01.227611
3	Promag	Kalbe Farma	2	8000.00	Meredakan sakit maag, nyeri ulu hati, dan gangguan asam lambung.	120	10	f	https://vhmggapaspvvtglkijyq.supabase.co/storage/v1/object/public/product-images/1764487062326_hqde2xt.jpg	t	f	0	0	2025-11-30 14:17:42.633697	2025-11-30 14:36:01.231586
4	Loperamide (Imodium)	Johnson & Johnson	2	20000.00	Untuk mengatasi diare akut.	60	10	f	https://vhmggapaspvvtglkijyq.supabase.co/storage/v1/object/public/product-images/1764487062637_iwv59f5.jpg	t	f	0	0	2025-11-30 14:17:42.87147	2025-11-30 14:36:01.236597
5	Cetirizine	Dexa Medica	3	25000.00	Antihistamin untuk alergi, bersin, atau gatal-gatal.	90	10	f	https://vhmggapaspvvtglkijyq.supabase.co/storage/v1/object/public/product-images/1764487062875_oxx3dd7.jpg	t	f	0	0	2025-11-30 14:17:43.280815	2025-11-30 14:36:01.241935
6	Salbutamol Inhaler	Glaxo Smith Kline	4	45000.00	Membantu meredakan sesak napas akibat asma atau bronkitis.	45	10	f	https://vhmggapaspvvtglkijyq.supabase.co/storage/v1/object/public/product-images/1764487063284_nclw1y3.jpg	t	f	0	0	2025-11-30 14:17:43.657924	2025-11-30 14:36:01.245683
7	Betadine	Mahakam Beta Farma	5	18000.00	Antiseptik luar untuk membersihkan luka ringan atau goresan.	150	10	f	https://vhmggapaspvvtglkijyq.supabase.co/storage/v1/object/public/product-images/1764487063660_ajk0vq6.jpg	t	f	0	0	2025-11-30 14:17:43.923397	2025-11-30 14:36:01.250053
8	Oralit	Pharos Indonesia	2	5000.00	Larutan rehidrasi untuk mencegah dehidrasi akibat diare atau muntah.	200	10	f	https://vhmggapaspvvtglkijyq.supabase.co/storage/v1/object/public/product-images/1764487063927_vhh0gvs.jpg	t	f	0	0	2025-11-30 14:17:44.225243	2025-11-30 14:36:01.255673
9	Vitamin C 500mg	Blackmores	6	25000.00	Meningkatkan daya tahan tubuh dan membantu penyembuhan.	95	10	f	https://vhmggapaspvvtglkijyq.supabase.co/storage/v1/object/public/product-images/1764487064228_z8k1673.jpg	t	f	0	0	2025-11-30 14:17:44.48066	2025-11-30 14:36:01.259577
10	Amoxicillin 500mg	Sanbe Farma	7	40000.00	Untuk infeksi bakteri ringan, seperti infeksi tenggorokan atau kulit.	50	10	t	https://vhmggapaspvvtglkijyq.supabase.co/storage/v1/object/public/product-images/1764487064483_ilqwwxx.jpg	t	f	0	0	2025-11-30 14:17:44.742223	2025-11-30 14:36:01.263727
11	Omeprazole 20mg	Dexa Medica	2	35000.00	Untuk mengatasi asam lambung berlebih dan maag kronis.	40	10	t	https://vhmggapaspvvtglkijyq.supabase.co/storage/v1/object/public/product-images/1764487064745_7h3dsuy.jpg	t	f	0	0	2025-11-30 14:17:45.012157	2025-11-30 14:36:01.267351
12	Vitamin D3 1000 IU	Nature Made	6	45000.00	Membantu penyerapan kalsium dan kesehatan tulang.	110	10	f	https://vhmggapaspvvtglkijyq.supabase.co/storage/v1/object/public/product-images/1764487065015_1pcbevy.jpg	t	f	0	0	2025-11-30 14:17:45.423328	2025-11-30 14:36:01.271609
13	Multivitamin Complete	Centrum	6	55000.00	Kombinasi lengkap vitamin dan mineral untuk kesehatan optimal.	130	10	f	https://vhmggapaspvvtglkijyq.supabase.co/storage/v1/object/public/product-images/1764487065428_utqxiyv.jpg	t	f	0	0	2025-11-30 14:17:46.73637	2025-11-30 14:36:01.27473
14	Alcohol 70%	OneMed	5	15000.00	Antiseptik untuk membersihkan tangan dan permukaan.	300	10	f	https://vhmggapaspvvtglkijyq.supabase.co/storage/v1/object/public/product-images/1764487066739_kg2e6mr.jpg	t	f	0	0	2025-11-30 14:17:47.005608	2025-11-30 14:36:01.279013
15	Captopril 25mg	Indofarma	8	30000.00	Obat untuk menurunkan tekanan darah tinggi.	40	10	t	https://vhmggapaspvvtglkijyq.supabase.co/storage/v1/object/public/product-images/1764487581553_qi04vx2.webp	t	f	0	0	2025-11-30 14:17:47.331225	2025-11-30 14:36:01.282682
\.


--
-- TOC entry 5306 (class 0 OID 35757)
-- Dependencies: 256
-- Data for Name: sales_reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sales_reports (report_id, report_date, total_orders, completed_orders, cancelled_orders, total_revenue, total_tax, total_discount, net_revenue, top_selling_product_id, top_selling_quantity, generated_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5290 (class 0 OID 35554)
-- Dependencies: 240
-- Data for Name: saved_for_later; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.saved_for_later (saved_id, user_id, product_id, saved_at) FROM stdin;
\.


--
-- TOC entry 5272 (class 0 OID 35341)
-- Dependencies: 222
-- Data for Name: user_addresses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_addresses (address_id, user_id, full_address, google_place_id, latitude, longitude, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 5268 (class 0 OID 35309)
-- Dependencies: 218
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, name, email, password_hash, phone, role, profile_photo_url, address, last_known_latitude, last_known_longitude, last_location_update, is_active, email_verified, created_at, updated_at) FROM stdin;
1	Demo Customer	customer@pharmahub.com	$2b$10$qfuiDEdz5L6kpuIqAL7Xc.8AWIjZ7v.pxups9MhNUxjIWdC.4kjg2	081234567890	customer	\N	Jl. Demo Customer No. 123, Jakarta	\N	\N	\N	t	f	2025-11-30 13:47:56.698885	2025-11-30 13:47:56.698885
2	Demo Admin	admin@pharmahub.com	$2b$10$3ZAYDe/D5FYW8MgHW6OYL.erIO1GCEzMhVvyYXT2w5ItEZH7wV8NK	081234567891	admin	\N	Jl. Demo Admin No. 456, Jakarta	\N	\N	\N	t	f	2025-11-30 13:47:56.778103	2025-11-30 13:47:56.778103
3	Test User	test@test.com	$2b$10$hZhQxpaT.hgl2.1zU10eJ.E889QU7tSMFvvK7DNpfqzm2SyvfMx9a	081234567899	customer	\N	\N	\N	\N	\N	t	f	2025-11-30 13:54:49.003672	2025-11-30 13:54:49.003672
4	Cart Test User	cart.test@pharmahub.com	$2b$10$TKBs99/VqJsh/.0UlInm5uxLFhBwxcDKYIGpmqHpCRMishBRfKIq2	\N	customer	\N	\N	\N	\N	\N	t	f	2025-11-30 16:06:02.015815	2025-11-30 16:06:02.015815
\.


--
-- TOC entry 5335 (class 0 OID 0)
-- Dependencies: 253
-- Name: admin_activity_logs_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_activity_logs_log_id_seq', 1, false);


--
-- TOC entry 5336 (class 0 OID 0)
-- Dependencies: 237
-- Name: cart_items_cart_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cart_items_cart_id_seq', 16, true);


--
-- TOC entry 5337 (class 0 OID 0)
-- Dependencies: 260
-- Name: coupon_usage_usage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.coupon_usage_usage_id_seq', 1, false);


--
-- TOC entry 5338 (class 0 OID 0)
-- Dependencies: 235
-- Name: coupons_coupon_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.coupons_coupon_id_seq', 4, true);


--
-- TOC entry 5339 (class 0 OID 0)
-- Dependencies: 251
-- Name: notification_preferences_preference_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notification_preferences_preference_id_seq', 1, false);


--
-- TOC entry 5340 (class 0 OID 0)
-- Dependencies: 249
-- Name: notifications_notification_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_notification_id_seq', 1, false);


--
-- TOC entry 5341 (class 0 OID 0)
-- Dependencies: 247
-- Name: order_delivery_tracking_tracking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_delivery_tracking_tracking_id_seq', 1, false);


--
-- TOC entry 5342 (class 0 OID 0)
-- Dependencies: 243
-- Name: order_items_order_item_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_items_order_item_id_seq', 1, false);


--
-- TOC entry 5343 (class 0 OID 0)
-- Dependencies: 245
-- Name: order_status_history_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.order_status_history_history_id_seq', 1, false);


--
-- TOC entry 5344 (class 0 OID 0)
-- Dependencies: 241
-- Name: orders_order_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orders_order_id_seq', 1, false);


--
-- TOC entry 5345 (class 0 OID 0)
-- Dependencies: 223
-- Name: password_reset_tokens_token_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_reset_tokens_token_id_seq', 1, false);


--
-- TOC entry 5346 (class 0 OID 0)
-- Dependencies: 219
-- Name: pharmacy_info_pharmacy_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pharmacy_info_pharmacy_id_seq', 1, true);


--
-- TOC entry 5347 (class 0 OID 0)
-- Dependencies: 225
-- Name: product_categories_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_categories_category_id_seq', 40, true);


--
-- TOC entry 5348 (class 0 OID 0)
-- Dependencies: 231
-- Name: product_details_detail_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_details_detail_id_seq', 42, true);


--
-- TOC entry 5349 (class 0 OID 0)
-- Dependencies: 229
-- Name: product_images_image_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_images_image_id_seq', 1, false);


--
-- TOC entry 5350 (class 0 OID 0)
-- Dependencies: 233
-- Name: product_reviews_review_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.product_reviews_review_id_seq', 1, false);


--
-- TOC entry 5351 (class 0 OID 0)
-- Dependencies: 227
-- Name: products_product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_product_id_seq', 29, true);


--
-- TOC entry 5352 (class 0 OID 0)
-- Dependencies: 255
-- Name: sales_reports_report_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sales_reports_report_id_seq', 1, false);


--
-- TOC entry 5353 (class 0 OID 0)
-- Dependencies: 239
-- Name: saved_for_later_saved_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.saved_for_later_saved_id_seq', 6, true);


--
-- TOC entry 5354 (class 0 OID 0)
-- Dependencies: 221
-- Name: user_addresses_address_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_addresses_address_id_seq', 1, false);


--
-- TOC entry 5355 (class 0 OID 0)
-- Dependencies: 217
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 4, true);


--
-- TOC entry 5066 (class 2606 OID 35747)
-- Name: admin_activity_logs admin_activity_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_activity_logs
    ADD CONSTRAINT admin_activity_logs_pkey PRIMARY KEY (log_id);


--
-- TOC entry 5019 (class 2606 OID 35538)
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (cart_id);


--
-- TOC entry 5076 (class 2606 OID 35819)
-- Name: coupon_usage coupon_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_pkey PRIMARY KEY (usage_id);


--
-- TOC entry 5012 (class 2606 OID 35506)
-- Name: coupons coupons_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key UNIQUE (code);


--
-- TOC entry 5014 (class 2606 OID 35504)
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (coupon_id);


--
-- TOC entry 5062 (class 2606 OID 35729)
-- Name: notification_preferences notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_pkey PRIMARY KEY (preference_id);


--
-- TOC entry 5064 (class 2606 OID 35731)
-- Name: notification_preferences notification_preferences_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_key UNIQUE (user_id);


--
-- TOC entry 5059 (class 2606 OID 35691)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (notification_id);


--
-- TOC entry 5051 (class 2606 OID 35667)
-- Name: order_delivery_tracking order_delivery_tracking_order_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_delivery_tracking
    ADD CONSTRAINT order_delivery_tracking_order_id_key UNIQUE (order_id);


--
-- TOC entry 5053 (class 2606 OID 35665)
-- Name: order_delivery_tracking order_delivery_tracking_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_delivery_tracking
    ADD CONSTRAINT order_delivery_tracking_pkey PRIMARY KEY (tracking_id);


--
-- TOC entry 5043 (class 2606 OID 35621)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (order_item_id);


--
-- TOC entry 5047 (class 2606 OID 35643)
-- Name: order_status_history order_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (history_id);


--
-- TOC entry 5037 (class 2606 OID 35596)
-- Name: orders orders_order_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_order_number_key UNIQUE (order_number);


--
-- TOC entry 5039 (class 2606 OID 35594)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (order_id);


--
-- TOC entry 4982 (class 2606 OID 35365)
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (token_id);


--
-- TOC entry 4984 (class 2606 OID 35367)
-- Name: password_reset_tokens password_reset_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_key UNIQUE (token);


--
-- TOC entry 4975 (class 2606 OID 35339)
-- Name: pharmacy_info pharmacy_info_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pharmacy_info
    ADD CONSTRAINT pharmacy_info_pkey PRIMARY KEY (pharmacy_id);


--
-- TOC entry 4987 (class 2606 OID 35388)
-- Name: product_categories product_categories_category_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_category_name_key UNIQUE (category_name);


--
-- TOC entry 4989 (class 2606 OID 35386)
-- Name: product_categories product_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_pkey PRIMARY KEY (category_id);


--
-- TOC entry 5003 (class 2606 OID 35454)
-- Name: product_details product_details_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_details
    ADD CONSTRAINT product_details_pkey PRIMARY KEY (detail_id);


--
-- TOC entry 5005 (class 2606 OID 35456)
-- Name: product_details product_details_product_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_details
    ADD CONSTRAINT product_details_product_id_key UNIQUE (product_id);


--
-- TOC entry 5000 (class 2606 OID 35436)
-- Name: product_images product_images_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (image_id);


--
-- TOC entry 5010 (class 2606 OID 35476)
-- Name: product_reviews product_reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_pkey PRIMARY KEY (review_id);


--
-- TOC entry 4996 (class 2606 OID 35414)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (product_id);


--
-- TOC entry 5072 (class 2606 OID 35772)
-- Name: sales_reports sales_reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_reports
    ADD CONSTRAINT sales_reports_pkey PRIMARY KEY (report_id);


--
-- TOC entry 5074 (class 2606 OID 35774)
-- Name: sales_reports sales_reports_report_date_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_reports
    ADD CONSTRAINT sales_reports_report_date_key UNIQUE (report_date);


--
-- TOC entry 5027 (class 2606 OID 35560)
-- Name: saved_for_later saved_for_later_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_for_later
    ADD CONSTRAINT saved_for_later_pkey PRIMARY KEY (saved_id);


--
-- TOC entry 5029 (class 2606 OID 35562)
-- Name: saved_for_later unique_saved_user_product; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_for_later
    ADD CONSTRAINT unique_saved_user_product UNIQUE (user_id, product_id);


--
-- TOC entry 5023 (class 2606 OID 35540)
-- Name: cart_items unique_user_product; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT unique_user_product UNIQUE (user_id, product_id);


--
-- TOC entry 4978 (class 2606 OID 35350)
-- Name: user_addresses user_addresses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_pkey PRIMARY KEY (address_id);


--
-- TOC entry 4971 (class 2606 OID 35324)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4973 (class 2606 OID 35322)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- TOC entry 4976 (class 1259 OID 35356)
-- Name: idx_addresses_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_addresses_user ON public.user_addresses USING btree (user_id);


--
-- TOC entry 5067 (class 1259 OID 35754)
-- Name: idx_admin_logs_action; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_logs_action ON public.admin_activity_logs USING btree (action_type);


--
-- TOC entry 5068 (class 1259 OID 35753)
-- Name: idx_admin_logs_admin; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_logs_admin ON public.admin_activity_logs USING btree (admin_id);


--
-- TOC entry 5069 (class 1259 OID 35755)
-- Name: idx_admin_logs_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_logs_created ON public.admin_activity_logs USING btree (created_at DESC);


--
-- TOC entry 5020 (class 1259 OID 35552)
-- Name: idx_cart_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_product ON public.cart_items USING btree (product_id);


--
-- TOC entry 5021 (class 1259 OID 35551)
-- Name: idx_cart_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_cart_user ON public.cart_items USING btree (user_id);


--
-- TOC entry 4985 (class 1259 OID 35394)
-- Name: idx_categories_parent; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_categories_parent ON public.product_categories USING btree (parent_category_id);


--
-- TOC entry 5077 (class 1259 OID 35835)
-- Name: idx_coupon_usage_coupon; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coupon_usage_coupon ON public.coupon_usage USING btree (coupon_id);


--
-- TOC entry 5078 (class 1259 OID 35837)
-- Name: idx_coupon_usage_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coupon_usage_order ON public.coupon_usage USING btree (order_id);


--
-- TOC entry 5079 (class 1259 OID 35836)
-- Name: idx_coupon_usage_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coupon_usage_user ON public.coupon_usage USING btree (user_id);


--
-- TOC entry 5015 (class 1259 OID 35508)
-- Name: idx_coupons_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coupons_active ON public.coupons USING btree (is_active);


--
-- TOC entry 5016 (class 1259 OID 35507)
-- Name: idx_coupons_code; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coupons_code ON public.coupons USING btree (code);


--
-- TOC entry 5017 (class 1259 OID 35509)
-- Name: idx_coupons_dates; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_coupons_dates ON public.coupons USING btree (start_date, end_date);


--
-- TOC entry 5048 (class 1259 OID 35679)
-- Name: idx_delivery_tracking_enabled; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_tracking_enabled ON public.order_delivery_tracking USING btree (is_tracking_enabled);


--
-- TOC entry 5049 (class 1259 OID 35678)
-- Name: idx_delivery_tracking_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_delivery_tracking_order ON public.order_delivery_tracking USING btree (order_id);


--
-- TOC entry 5060 (class 1259 OID 35737)
-- Name: idx_notif_pref_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notif_pref_user ON public.notification_preferences USING btree (user_id);


--
-- TOC entry 5054 (class 1259 OID 35715)
-- Name: idx_notifications_created; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_created ON public.notifications USING btree (created_at DESC);


--
-- TOC entry 5055 (class 1259 OID 35714)
-- Name: idx_notifications_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_read ON public.notifications USING btree (user_id, is_read);


--
-- TOC entry 5056 (class 1259 OID 35713)
-- Name: idx_notifications_type; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_type ON public.notifications USING btree (type);


--
-- TOC entry 5057 (class 1259 OID 35712)
-- Name: idx_notifications_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user ON public.notifications USING btree (user_id);


--
-- TOC entry 5040 (class 1259 OID 35632)
-- Name: idx_order_items_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_order ON public.order_items USING btree (order_id);


--
-- TOC entry 5041 (class 1259 OID 35633)
-- Name: idx_order_items_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_order_items_product ON public.order_items USING btree (product_id);


--
-- TOC entry 5030 (class 1259 OID 35611)
-- Name: idx_orders_created_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_created_at ON public.orders USING btree (created_at DESC);


--
-- TOC entry 5031 (class 1259 OID 35612)
-- Name: idx_orders_customer_phone; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_customer_phone ON public.orders USING btree (customer_phone);


--
-- TOC entry 5032 (class 1259 OID 35607)
-- Name: idx_orders_order_number; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_order_number ON public.orders USING btree (order_number);


--
-- TOC entry 5033 (class 1259 OID 35610)
-- Name: idx_orders_payment_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_payment_status ON public.orders USING btree (payment_status);


--
-- TOC entry 5034 (class 1259 OID 35609)
-- Name: idx_orders_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_status ON public.orders USING btree (order_status);


--
-- TOC entry 5035 (class 1259 OID 35608)
-- Name: idx_orders_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_orders_user ON public.orders USING btree (user_id);


--
-- TOC entry 5001 (class 1259 OID 35462)
-- Name: idx_product_details_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_details_product ON public.product_details USING btree (product_id);


--
-- TOC entry 4997 (class 1259 OID 35443)
-- Name: idx_product_images_primary; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_images_primary ON public.product_images USING btree (product_id, is_primary);


--
-- TOC entry 4998 (class 1259 OID 35442)
-- Name: idx_product_images_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_product_images_product ON public.product_images USING btree (product_id);


--
-- TOC entry 4990 (class 1259 OID 35423)
-- Name: idx_products_active; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_active ON public.products USING btree (is_active);


--
-- TOC entry 4991 (class 1259 OID 35420)
-- Name: idx_products_category; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_category ON public.products USING btree (category_id);


--
-- TOC entry 4992 (class 1259 OID 35424)
-- Name: idx_products_featured; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_featured ON public.products USING btree (featured);


--
-- TOC entry 4993 (class 1259 OID 35421)
-- Name: idx_products_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_name ON public.products USING btree (name);


--
-- TOC entry 4994 (class 1259 OID 35422)
-- Name: idx_products_prescription; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_products_prescription ON public.products USING btree (prescription_required);


--
-- TOC entry 4979 (class 1259 OID 35373)
-- Name: idx_reset_tokens_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reset_tokens_token ON public.password_reset_tokens USING btree (token);


--
-- TOC entry 4980 (class 1259 OID 35374)
-- Name: idx_reset_tokens_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reset_tokens_user ON public.password_reset_tokens USING btree (user_id);


--
-- TOC entry 5006 (class 1259 OID 35487)
-- Name: idx_reviews_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_product ON public.product_reviews USING btree (product_id);


--
-- TOC entry 5007 (class 1259 OID 35489)
-- Name: idx_reviews_rating; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_rating ON public.product_reviews USING btree (rating);


--
-- TOC entry 5008 (class 1259 OID 35488)
-- Name: idx_reviews_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_reviews_user ON public.product_reviews USING btree (user_id);


--
-- TOC entry 5070 (class 1259 OID 35780)
-- Name: idx_sales_reports_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_sales_reports_date ON public.sales_reports USING btree (report_date DESC);


--
-- TOC entry 5024 (class 1259 OID 35574)
-- Name: idx_saved_product; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_saved_product ON public.saved_for_later USING btree (product_id);


--
-- TOC entry 5025 (class 1259 OID 35573)
-- Name: idx_saved_user; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_saved_user ON public.saved_for_later USING btree (user_id);


--
-- TOC entry 5044 (class 1259 OID 35655)
-- Name: idx_status_history_changed_at; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_status_history_changed_at ON public.order_status_history USING btree (changed_at DESC);


--
-- TOC entry 5045 (class 1259 OID 35654)
-- Name: idx_status_history_order; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_status_history_order ON public.order_status_history USING btree (order_id);


--
-- TOC entry 4968 (class 1259 OID 35325)
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- TOC entry 4969 (class 1259 OID 35326)
-- Name: idx_users_role; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_users_role ON public.users USING btree (role);


--
-- TOC entry 5113 (class 2620 OID 35809)
-- Name: products trigger_low_stock_alert; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_low_stock_alert AFTER INSERT OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.check_low_stock();


--
-- TOC entry 5116 (class 2620 OID 35807)
-- Name: orders trigger_order_notification; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_order_notification AFTER INSERT OR UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.create_order_notification();


--
-- TOC entry 5118 (class 2620 OID 35805)
-- Name: order_items trigger_update_stock; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER trigger_update_stock AFTER INSERT ON public.order_items FOR EACH ROW EXECUTE FUNCTION public.update_product_stock_after_order();


--
-- TOC entry 5115 (class 2620 OID 35802)
-- Name: cart_items update_cart_items_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5117 (class 2620 OID 35799)
-- Name: orders update_orders_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5112 (class 2620 OID 35801)
-- Name: product_categories update_product_categories_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_product_categories_updated_at BEFORE UPDATE ON public.product_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5114 (class 2620 OID 35798)
-- Name: products update_products_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5111 (class 2620 OID 35800)
-- Name: user_addresses update_user_addresses_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_user_addresses_updated_at BEFORE UPDATE ON public.user_addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5110 (class 2620 OID 35797)
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- TOC entry 5105 (class 2606 OID 35748)
-- Name: admin_activity_logs admin_activity_logs_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_activity_logs
    ADD CONSTRAINT admin_activity_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5088 (class 2606 OID 35546)
-- Name: cart_items cart_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- TOC entry 5089 (class 2606 OID 35541)
-- Name: cart_items cart_items_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5107 (class 2606 OID 35820)
-- Name: coupon_usage coupon_usage_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(coupon_id) ON DELETE CASCADE;


--
-- TOC entry 5108 (class 2606 OID 35830)
-- Name: coupon_usage coupon_usage_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE SET NULL;


--
-- TOC entry 5109 (class 2606 OID 35825)
-- Name: coupon_usage coupon_usage_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5104 (class 2606 OID 35732)
-- Name: notification_preferences notification_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notification_preferences
    ADD CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5100 (class 2606 OID 35707)
-- Name: notifications notifications_related_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_related_coupon_id_fkey FOREIGN KEY (related_coupon_id) REFERENCES public.coupons(coupon_id) ON DELETE SET NULL;


--
-- TOC entry 5101 (class 2606 OID 35697)
-- Name: notifications notifications_related_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_related_order_id_fkey FOREIGN KEY (related_order_id) REFERENCES public.orders(order_id) ON DELETE SET NULL;


--
-- TOC entry 5102 (class 2606 OID 35702)
-- Name: notifications notifications_related_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_related_product_id_fkey FOREIGN KEY (related_product_id) REFERENCES public.products(product_id) ON DELETE SET NULL;


--
-- TOC entry 5103 (class 2606 OID 35692)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5098 (class 2606 OID 35668)
-- Name: order_delivery_tracking order_delivery_tracking_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_delivery_tracking
    ADD CONSTRAINT order_delivery_tracking_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE;


--
-- TOC entry 5099 (class 2606 OID 35673)
-- Name: order_delivery_tracking order_delivery_tracking_pharmacy_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_delivery_tracking
    ADD CONSTRAINT order_delivery_tracking_pharmacy_id_fkey FOREIGN KEY (pharmacy_id) REFERENCES public.pharmacy_info(pharmacy_id);


--
-- TOC entry 5094 (class 2606 OID 35622)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE;


--
-- TOC entry 5095 (class 2606 OID 35627)
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id);


--
-- TOC entry 5096 (class 2606 OID 35649)
-- Name: order_status_history order_status_history_changed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES public.users(user_id);


--
-- TOC entry 5097 (class 2606 OID 35644)
-- Name: order_status_history order_status_history_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.order_status_history
    ADD CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(order_id) ON DELETE CASCADE;


--
-- TOC entry 5092 (class 2606 OID 35602)
-- Name: orders orders_current_courier_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_current_courier_id_fkey FOREIGN KEY (current_courier_id) REFERENCES public.users(user_id);


--
-- TOC entry 5093 (class 2606 OID 35597)
-- Name: orders orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id);


--
-- TOC entry 5081 (class 2606 OID 35368)
-- Name: password_reset_tokens password_reset_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5082 (class 2606 OID 35389)
-- Name: product_categories product_categories_parent_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_categories
    ADD CONSTRAINT product_categories_parent_category_id_fkey FOREIGN KEY (parent_category_id) REFERENCES public.product_categories(category_id);


--
-- TOC entry 5085 (class 2606 OID 35457)
-- Name: product_details product_details_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_details
    ADD CONSTRAINT product_details_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- TOC entry 5084 (class 2606 OID 35437)
-- Name: product_images product_images_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- TOC entry 5086 (class 2606 OID 35477)
-- Name: product_reviews product_reviews_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- TOC entry 5087 (class 2606 OID 35482)
-- Name: product_reviews product_reviews_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.product_reviews
    ADD CONSTRAINT product_reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5083 (class 2606 OID 35415)
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.product_categories(category_id);


--
-- TOC entry 5106 (class 2606 OID 35775)
-- Name: sales_reports sales_reports_top_selling_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sales_reports
    ADD CONSTRAINT sales_reports_top_selling_product_id_fkey FOREIGN KEY (top_selling_product_id) REFERENCES public.products(product_id);


--
-- TOC entry 5090 (class 2606 OID 35568)
-- Name: saved_for_later saved_for_later_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_for_later
    ADD CONSTRAINT saved_for_later_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(product_id) ON DELETE CASCADE;


--
-- TOC entry 5091 (class 2606 OID 35563)
-- Name: saved_for_later saved_for_later_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.saved_for_later
    ADD CONSTRAINT saved_for_later_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- TOC entry 5080 (class 2606 OID 35351)
-- Name: user_addresses user_addresses_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_addresses
    ADD CONSTRAINT user_addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


-- Completed on 2025-11-30 17:17:04

--
-- PostgreSQL database dump complete
--

\unrestrict B9vZlZDnO8HDTvbJR20ym3JsbvOmSWAAVjZ9o0S4SYwIBXEZdQBUhyZMZSM13CI

