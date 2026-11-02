package com.bizflow.adapter;

/** Optional Java enterprise-service scaffold. The local MVP runs without it. */
public final class Health {
    private Health() {}
    public static String status() {
        return "BizFlow Java adapter scaffolded; connect MongoDB before enabling business endpoints.";
    }
    public static void main(String[] args) { System.out.println(status()); }
}
