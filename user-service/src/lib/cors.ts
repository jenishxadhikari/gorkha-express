import type { CorsOptions } from "cors";

import { env } from "../config/env.js";

export const corsOptions: CorsOptions = {
  origin: function(origin, callback){
    if(!origin){
      return callback(null, true)
    }

    if(env.ALLOWED_ORIGINS.includes(origin)){
      return callback(null, true)
    }

    return callback(new Error("Not allowed by CORS"))
  }
};
