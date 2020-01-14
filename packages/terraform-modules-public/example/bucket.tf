# For managing terraform state remotely
terraform {
  backend "gcs" {
    bucket = "my_celo_tf_state_jcortejoso"
  }
}

// terraform {
//   backend "gcs" {
//     bucket = "my_bucket"
//     prefix = "my_tfs/celo"
//   }
// }